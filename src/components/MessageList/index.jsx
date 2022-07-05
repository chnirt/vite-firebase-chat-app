import React, { useCallback, useEffect, useRef, useState } from 'react'

import { addDocument, getColRef } from '../../firebase/service'
import { useFetch } from '../../firebase/hooks'
import { useAuth } from '../../context'
import MessageBody from '../MessageBody'

export const MessageList = ({ currentChat }) => {
  const { user } = useAuth()
  const scrollSpanRef = useRef(null)
  const [text, setText] = useState('')
  const [messageList, setMessageList] = useState([])
  const {
    loading,
    data: messages,
    moreLoading,
    loadedAll,
    handleLoadMore,
  } = useFetch('messages', {
    type: 'collectionGroup',
    limit: 10,
  })

  const handleSendMessage = useCallback(
    async (newMessage) => {
      if (!newMessage) return

      const messageColRef = getColRef('chats', currentChat.id, 'messages')
      const messageData = {
        text: newMessage,
        sender: user.uid,
      }
      await addDocument(messageColRef, messageData)
      setText('')
    },
    [currentChat]
  )

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
        <MessageBody messages={messages} />
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