import { Button, Row } from 'antd'
import {
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'

import { getColRef } from '../../firebase/service'
import { LoadingChatList } from '../LoadingChatList'
import { ChatItem } from '../ChatItem'
import { useAuth } from '../../context'
import { decryptJwk, getDeriveKey } from '../../utils/e2ee'

const LIMIT = 15

export const ChatListBody = ({ handleJoinChat = () => { } }) => {
  const auth = useAuth()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [last, setLast] = useState(null)
  const [moreLoading, setMoreLoading] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  const handleDecryptE2EE = useCallback(async (publicKey, privateKey, text) => {
    const deriveKey = await getDeriveKey(publicKey, privateKey)
    const decryptedText = await decryptJwk(text, deriveKey)
    return decryptedText
  }, [])

  const fetchData = useCallback(async () => {
    //  console.log('fetchData')

    if (loading) {
      return
    }

    setLoading(true)

    const limitNumber = LIMIT + 1

    const chatsDocRef = getColRef('chats')
    const first = query(
      chatsDocRef,
      where('members', 'array-contains', auth?.user?.uid),
      orderBy('createdAt', 'desc'),
      limit(limitNumber)
    )

    // onSnapshot
    onSnapshot(first, async (querySnapshot) => {
      const docs = querySnapshot.docs.slice(0, LIMIT)
      // const data = docs.map((docSnapshot) => {
      //   return {
      //     id: docSnapshot.id,
      //     ...docSnapshot.data(),
      //   }
      // })
      const data = await Promise.all(
        docs
          .map(async (docSnapshot) => {
            const data = docSnapshot.data()
            const q = query(
              getColRef('users'),
              ...(data?.members.length > 0
                ? [where('uid', 'in', data?.members)]
                : []),
              orderBy('createdAt', 'desc')
            )
            const querySnapshot = await getDocs(q)
            const docs = querySnapshot.docs
            const members = docs.map((docSnapshot) => {
              return {
                id: docSnapshot.id,
                ...docSnapshot.data(),
              }
            })
            const publicKey = [...members].filter(
              (member) => member.id !== auth?.user?.uid
            )[0]?.jwkKeys?.publicKeyJwk
            const privateKey = auth?.user?.jwkKeys?.privateKeyJwk

            const latestMessage = data?.latestMessage
            const isMessage = data?.type === 'message'
            const decryptedMessage = await handleDecryptE2EE(
              publicKey,
              privateKey,
              latestMessage
            )
            return {
              id: docSnapshot.id,
              ...docSnapshot.data(),
              latestMessage: isMessage ? decryptedMessage : latestMessage,
            }
          })
          .reverse()
      )
      setData(data)
      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)
      const size = querySnapshot.size
      setLoadedAll(size < limitNumber)

      querySnapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          // console.log("New city: ", change.doc.data());
        }
        if (change.type === 'modified') {
          // console.log("Modified city: ", change.doc.data());
        }
        if (change.type === 'removed') {
          // console.log("Removed city: ", change.doc.data());
        }
      })
    })

    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [loading, auth])

  const fetchMoreData = useCallback(async () => {
    // console.log('fetchMoreData')

    if (moreLoading || loadedAll) {
      return
    }

    setMoreLoading(true)

    const limitNumber = LIMIT + 1

    const chatsDocRef = getColRef('chats')
    const next = query(
      chatsDocRef,
      where('members', 'array-contains', auth?.user?.uid),
      orderBy('createdAt', 'desc'),
      limit(limitNumber),
      ...(last ? [startAfter(last)] : [])
    )

    // onSnapshot
    onSnapshot(next, async (querySnapshot) => {
      const docs = querySnapshot.docs.slice(0, LIMIT)
      // const data = docs.map((docSnapshot) => {
      //   return {
      //     id: docSnapshot.id,
      //     ...docSnapshot.data(),
      //   }
      // })
      const data = await Promise.all(
        docs
          .map(async (docSnapshot) => {
            const data = docSnapshot.data()
            const q = query(
              getColRef('users'),
              ...(data?.members.length > 0
                ? [where('uid', 'in', data?.members)]
                : []),
              orderBy('createdAt', 'desc')
            )
            const querySnapshot = await getDocs(q)
            const docs = querySnapshot.docs
            const members = docs.map((docSnapshot) => {
              return {
                id: docSnapshot.id,
                ...docSnapshot.data(),
              }
            })
            const publicKey = [...members].filter(
              (member) => member.id !== auth?.user?.uid
            )[0]?.jwkKeys?.publicKeyJwk
            const privateKey = auth?.user?.jwkKeys?.privateKeyJwk
            const latestMessage = data?.latestMessage
            const isMessage = data?.type === 'message'
            const decryptedMessage = await handleDecryptE2EE(
              publicKey,
              privateKey,
              latestMessage
            )
            return {
              id: docSnapshot.id,
              ...docSnapshot.data(),
              latestMessage: isMessage ? decryptedMessage : latestMessage,
            }
          })
          .reverse()
      )
      setData((prevState) => [...prevState, ...data])
      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)
      const size = querySnapshot.size
      setLoadedAll(size < limitNumber)
    })

    setTimeout(() => {
      setMoreLoading(false)
    }, 1000)
  }, [last, moreLoading, loadedAll])

  useEffect(() => {
    fetchData()
  }, [])

  const LoadMoreChatList = useCallback(
    () =>
      !loadedAll && !moreLoading ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            height: 32,
            lineHeight: '32px',
          }}
        >
          <Button onClick={fetchMoreData}>Load more</Button>
        </div>
      ) : null,
    [loadedAll, moreLoading, fetchMoreData]
  )

  return (
    <div>
      <Row
        style={{
          height: 'calc(100% - 63px)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            paddingTop: 8,
            overflow: 'hidden auto',
            height: '100%',
            width: '100%',
          }}
        >
          {data.length > 0 ? (
            <div>
              {data.map((chat, ci) => {
                return (
                  <ChatItem
                    key={`chat-${ci}`}
                    chat={chat}
                    handleJoinChat={handleJoinChat}
                  />
                )
              })}
              <LoadMoreChatList />
            </div>
          ) : (
            <LoadingChatList />
          )}
        </div>
      </Row>
    </div>
  )
}
