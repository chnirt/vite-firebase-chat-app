import { useCallback, useEffect, useRef, useState } from 'react'
import {
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore'
import moment from 'moment'
import { Button, Col } from 'antd'

import { useAuth } from '../../context'
import { getColRef } from '../../firebase/service'
import { MessageItem } from '../../components'
import { decryptJwk, getDeriveKey } from '../../utils/e2ee'

const LIMIT = 15

export const MessageListBody = ({ currentChat }) => {
  const auth = useAuth()
  const scrollSpanRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [last, setLast] = useState(null)
  const [moreLoading, setMoreLoading] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  const publicKey = [...currentChat.members].filter(
    (member) => member.id !== auth?.user?.uid
  )[0]?.jwkKeys?.publicKeyJwk
  const privateKey = auth?.user?.jwkKeys?.privateKeyJwk

  const handleDecryptE2EE = useCallback(async (publicKey, privateKey, text) => {
    const deriveKey = await getDeriveKey(publicKey, privateKey)
    const decryptedText = await decryptJwk(text, deriveKey)
    return decryptedText
  }, [])

  const fetchData = useCallback(async () => {
    // console.log('fetchData')

    if (loading) {
      return
    }

    setLoading(true)

    const limitNumber = LIMIT + 1

    const messageDocRef = getColRef('chats', currentChat.id, 'messages')
    const first = query(
      messageDocRef,
      orderBy('createdAt', 'desc'),
      limit(limitNumber)
    )

    // onSnapshot
    onSnapshot(first, async (querySnapshot) => {
      const docs = querySnapshot.docs.slice(0, LIMIT)
      // const data = docs
      //   .map((docSnapshot) => {
      //     return {
      //       id: docSnapshot.id,
      //       ...docSnapshot.data(),
      //     }
      //   })
      //   .reverse()
      const data = await Promise.all(
        docs
          .map(async (docSnapshot) => {
            const data = docSnapshot.data()
            const text = data?.text
            const decryptedMessage = await handleDecryptE2EE(
              publicKey,
              privateKey,
              text
            )
            return {
              id: docSnapshot.id,
              ...docSnapshot.data(),
              text: decryptedMessage,
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
          scrollSpanRef.current?.scrollIntoView({
            behavior: 'smooth',
          })
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
  }, [currentChat, loading])

  const fetchMoreData = useCallback(async () => {
    // console.log('fetchMoreData')

    if (moreLoading || loadedAll) {
      return
    }

    setMoreLoading(true)

    const limitNumber = LIMIT + 1

    const messageDocRef = getColRef('chats', currentChat.id, 'messages')
    const next = query(
      messageDocRef,
      orderBy('createdAt', 'desc'),
      limit(limitNumber),
      ...(last ? [startAfter(last)] : [])
    )

    // onSnapshot
    onSnapshot(next, (querySnapshot) => {
      const docs = querySnapshot.docs.slice(0, LIMIT)
      const data = docs
        .map((docSnapshot) => {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }
        })
        .reverse()
      setData((prevState) => [...data, ...prevState])
      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)
      const size = querySnapshot.size
      setLoadedAll(size < limitNumber)
    })

    setTimeout(() => {
      setMoreLoading(false)
    }, 1000)
  }, [currentChat, last, moreLoading, loadedAll])

  useEffect(() => {
    fetchData().then(() => {
      scrollSpanRef.current?.scrollIntoView({
        behavior: 'smooth',
      })
    })
  }, [currentChat])

  useEffect(() => {
    scrollSpanRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [loading])

  const LoadMoreMessageList = useCallback(
    () =>
      !loadedAll && !moreLoading ? (
        <div
          style={{
            textAlign: 'center',
            // marginTop: 12,
            height: 32,
            lineHeight: '32px',
            marginBottom: 8,
          }}
        >
          <Button onClick={fetchMoreData}>Load more</Button>
        </div>
      ) : null,
    [fetchMoreData]
  )

  if (data.length === 0 || loading)
    return (
      <Col
        style={{
          overflow: 'hidden scroll',
          padding: '20px 20px 0 20px',
          // border: '1px solid black',
          height: 'calc(var(--app-height) - 236px)',
        }}
      />
    )

  return (
    <Col
      style={{
        overflow: 'hidden scroll',
        padding: '20px 20px 0 20px',
        // border: '1px solid black',
        height: 'calc(var(--app-height) - 236px)',
      }}
    >
      <LoadMoreMessageList />
      {data.length > 0 &&
        data.map((message, mi) => {
          const id = message?.id
          const isSender = auth?.user?.uid === message?.sender
          const text = message?.text
          const jwkText = message?.jwkText
          const createdAt = moment(message?.createdAt?.toDate()).fromNow()
          const avatar = currentChat?.members?.find(
            (member) => member?.uid === message?.sender
          )?.avatar
          const file = message?.file
          const type = message?.type
          const messageData = {
            type,
            isSender,
            avatar,
            text,
            jwkText,
            createdAt,
            file,
          }

          return (
            <MessageItem
              key={`message-${mi}-${id}`}
              currentChat={currentChat}
              message={messageData}
            />
          )
        })}

      <span ref={scrollSpanRef} />
    </Col>
  )
}
