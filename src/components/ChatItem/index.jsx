import { getDocs, query, where } from 'firebase/firestore'
import moment from 'moment'
import React, { useEffect, useState } from 'react'

import { getColRef } from '../../firebase/service'

export const ChatItem = ({ chat, handleJoinChat = () => { } }) => {
  const [chatDetail, setChatDetail] = useState(null)

  useEffect(() => {
    const fetchChatDetail = async () => {
      const userDocRef = getColRef('users')
      const q = query(userDocRef, where('uid', 'in', chat.members))
      const querySnapshot = await getDocs(q)
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      setChatDetail({
        ...chat,
        members: data,
      })
    }
    fetchChatDetail()
  }, [chat])

  if (!chatDetail) return null

  const id = chat.id
  const createdAt = chat.createdAt
  const chatName = chatDetail?.members?.map((item) => item.username).join(', ')

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
      <button onClick={() => handleJoinChat(chatDetail)}>Join</button>
    </div>
  )
}
