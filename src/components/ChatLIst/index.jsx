import { getDocs, orderBy, query } from 'firebase/firestore'
import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../context'

import { useFetch } from '../../firebase/hooks'
import { getColRef } from '../../firebase/service'

export const ChatList = ({
  handleJoinChat = () => { },
  findRelationship = () => { },
}) => {
  const { user } = useAuth()
  const {
    loading,
    data: chats,
    moreLoading,
    loadedAll,
    handleLoadMore,
  } = useFetch('chats', {
    limit: 3,
  })
  // const [relationshipList, setRelationshipList] = useState([])

  // const getRelationship = useCallback(async () => {
  //   const followerDocRef = getColRef('users', user.uid, 'following')
  //   const q = query(followerDocRef, orderBy('createdAt', 'desc'))
  //   const querySnapshot = await getDocs(q)
  //   const docs = querySnapshot.docs
  //   const data = docs.map((docSnapshot) => {
  //     return {
  //       id: docSnapshot.id,
  //       ...docSnapshot.data(),
  //     }
  //   })
  //   setRelationshipList(data)
  //   return data
  // }, [user?.uid])

  // const findRelationship = useCallback(
  //   (uids) => {
  //     const foundRelationship = relationshipList.filter((item) =>
  //       uids.some((uou) => uou === item.uid)
  //     )
  //     if (foundRelationship.length === 0) return
  //     return foundRelationship
  //   },
  //   [relationshipList]
  // )

  // useEffect(() => {
  //   getRelationship()
  // }, [getRelationship])

  return (
    <div
      style={{
        height: 500,
        flex: 1,
        border: 'solid 1px black',
        overflowY: 'scroll',
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      ChatList
      {loading && <span>Collection: Loading...</span>}
      {chats.length > 0 && (
        <div>
          {chats.map((doc) => {
            const id = doc.id
            const createdAt = doc.createdAt
            const foundRelationship = findRelationship(doc.members) ?? []
            console.log(foundRelationship)
            const chatName = foundRelationship
              .map((item) => item.username)
              .join(', ')
            return (
              <div
                key={`chat-${id}`}
                style={{
                  border: 'solid 1px black',
                  margin: 8,
                  display: 'flex',
                  flexDirection: 'row',
                  // justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <p
                  style={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    width: 100,
                  }}
                >
                  {chatName}
                </p>
                <p>{moment(createdAt?.toDate()).fromNow()}</p>
                <button onClick={() => handleJoinChat(doc)}>Join</button>
              </div>
            )
          })}
        </div>
      )}
      {!loadedAll ? (
        moreLoading ? (
          <span>Collection: Loading...</span>
        ) : (
          <button onClick={handleLoadMore}>Load more</button>
        )
      ) : null}
    </div>
  )
}
