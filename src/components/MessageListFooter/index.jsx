import { Fragment, useCallback, useState } from 'react'
import { Button, Input, Row } from 'antd'
import { BsImage } from 'react-icons/bs'
import { FiHeart } from 'react-icons/fi'
import { AiOutlineSmile } from 'react-icons/ai'

import { addDocument, getColRef, getDocRef, updateDocument } from '../../firebase/service'
import { useAuth } from '../../context'

export const MessageListFooter = ({ currentChat }) => {
  const auth = useAuth()
  const [message, setMessage] = useState('')
  const hasCharacter = message.length > 0

  const handleGetInfo = useCallback(() => { }, [])

  const handleSubmit = useCallback(
    async () => {
      console.log('hello', String(message).trim())

      const messageColRef = getColRef('chats', currentChat.id, 'messages')
      const messageData = {
        text: message,
        sender: auth?.user?.uid,
      }
      await addDocument(messageColRef, messageData)

      const chatDocRef = getDocRef('chats', currentChat.id)
      const chatData = {
        latestMessage: message,
      }
      await updateDocument(chatDocRef, chatData)

      setMessage('')
    },
    [message]
  )

  const handleUploadImage = useCallback(() => { }, [])

  const handleSendLove = useCallback(() => { }, [])

  return (
    <Row
      style={{
        padding: '20px',
      }}
      align="middle"
      justify="space-between"
    >
      <Row
        style={{
          borderRadius: 22,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: '#F0F0F0',
          width: '100%',
          paddingLeft: 11,
          paddingRight: 8,
          minHeight: '44px',
        }}
        justify="space-between"
        align="middle"
      >
        <Button
          style={{
            border: 0,
            boxShadow: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          ghost
          shape="circle"
          icon={<AiOutlineSmile size={20} color="#767676" />}
          onClick={handleGetInfo}
        />
        <Row
          style={{
            width: `calc(100% - ${hasCharacter ? '98px' : '96px'})`,
          }}
          align="middle"
        >
          <Input
            style={{
              borderWidth: 0,
            }}
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPressEnter={handleSubmit}
          />
        </Row>
        {hasCharacter ? (
          <Button
            type="link"
            style={{
              color: '#0095f6',
            }}
            disabled={!hasCharacter}
            onClick={handleSubmit}
          >
            Send
          </Button>
        ) : (
          <Fragment>
            <Button
              style={{
                border: 0,
                boxShadow: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              ghost
              shape="circle"
              icon={<BsImage size={20} color="#767676" />}
              onClick={handleUploadImage}
            />
            <Button
              style={{
                border: 0,
                boxShadow: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              ghost
              shape="circle"
              icon={<FiHeart size={20} color="#767676" />}
              onClick={handleSendLove}
            />
          </Fragment>
        )}
      </Row>
    </Row>
  )
}
