import { useCallback, useEffect, useRef, useState } from 'react'
import { limitToLast, onSnapshot, orderBy, query } from 'firebase/firestore'

import {
  addDocument,
  getColRef,
  getDocRef,
  updateDocument,
} from '../../firebase/service'
import { useAuth } from '../../context'
import MessageBody from '../MessageBody'

export const MessageList = ({ currentChat }) => {
  const { user } = useAuth()
  const scrollSpanRef = useRef(null)
  const [text, setText] = useState('')
  const [messageList, setMessageList] = useState([])

  const handleSendMessage = useCallback(
    async (newMessage) => {
      if (!newMessage) return

      const messageColRef = getColRef('chats', currentChat.id, 'messages')
      const messageData = {
        text: newMessage,
        sender: user.uid,
      }
      await addDocument(messageColRef, messageData)

      const chatDocRef = getDocRef('chats', currentChat.id)
      const chatData = {
        latestMessage: `${user?.username}: ${newMessage}`,
      }
      await updateDocument(chatDocRef, chatData)
      setText('')
    },
    [currentChat]
  )

  useEffect(() => {
    if (!currentChat) return
    const messageDocRef = getColRef('chats', currentChat.id, 'messages')
    const q = query(messageDocRef, orderBy('createdAt', 'asc'), limitToLast(10))
    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const data = querySnapshot.docs.map((docSnapshot) => {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }
        })
        setMessageList(data)
      },
      (error) => {
        console.log(error)
      }
    )
    return () => {
      unsubscribe()
    }
  }, [currentChat])

  useEffect(() => {
    scrollSpanRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messageList])

  if (currentChat === null) {
    return (
      <div
        style={{
          height: 500,
          flex: 4,
          border: 'solid 1px black',
          overflowY: 'scroll',
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        Empty Chat
      </div>
    )
  }

  return (
    <div
      style={{
        height: 500,
        flex: 4,
        display: 'flex',
        flexDirection: 'column',
        // border: 'solid 1px black',
        // overflowY: 'scroll',
        // paddingTop: 8,
        // paddingBottom: 8,
      }}
    >
      MessageList
      <div
        style={{
          overflowY: 'scroll',
          flex: 1,
        }}
      >
        <MessageBody messageList={messageList} currentChat={currentChat} />
        <span ref={scrollSpanRef} />
      </div>
      <input
        type="text"
        placeholder="Typing..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => {
          if (e.code === 'Enter') {
            handleSendMessage(text)
          }
        }}
      />
    </div>
  )
}
