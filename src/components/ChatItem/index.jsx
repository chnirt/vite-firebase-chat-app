import { getDocs, query, where } from 'firebase/firestore'
import moment from 'moment'
import React, { useEffect, useState } from 'react'

import { useAuth } from '../../context'
import { getColRef } from '../../firebase/service'

export const ChatItem = ({ chat, handleJoinChat = () => { } }) => {
  const { user } = useAuth()
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
  const latestMessage = chat.latestMessage
  const updatedAt = chat.updatedAt
  const members = chat?.members
  const chatName =
    members?.length <= 2
      ? chatDetail?.members.find((member) => member.uid !== user.uid)?.username
      : chatDetail?.members
        ?.map((item) => item.username)
        .sort((a, b) => {
          if (a === user.username) return 1
          if (b === user.username) return -1
          return 0
        })
        .join(', ')

  return (
    <div
      key={`chat-${id}`}
      style={{
        border: 'solid 1px black',
        margin: 8,
        // display: 'flex',
        // flexDirection: 'row',
        // justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p
        style={{
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          width: 200,
        }}
      >
        {chatName}
      </p>
      <p>{latestMessage}</p>
      <p>{moment(updatedAt?.toDate()).fromNow()}</p>
      <button onClick={() => handleJoinChat(chatDetail)}>Join</button>
    </div>
  )
}
