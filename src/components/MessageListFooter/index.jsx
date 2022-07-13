import { Fragment, useCallback, useState } from 'react'
import { Button, Input, Row, Upload, message as antdMessage } from 'antd'
import { FiHeart } from 'react-icons/fi'
import { AiOutlineSmile } from 'react-icons/ai'
import debounce from 'lodash/debounce'

import {
  addDocument,
  getColRef,
  getDocRef,
  updateDocument,
} from '../../firebase/service'
import { useAuth } from '../../context'
import { IoImageOutline } from 'react-icons/io5'
import { uploadStorageBytesResumable } from '../../firebase/storage'

export const MessageListFooter = ({ currentChat }) => {
  const auth = useAuth()
  const [message, setMessage] = useState('')
  const hasCharacter = message.length > 0

  const handleGetInfo = useCallback(() => { }, [])

  const handleSubmit = useCallback(async () => {
    if (!message) return

    const newMessage = String(message).trim()
    const messageColRef = getColRef('chats', currentChat.id, 'messages')
    const messageData = {
      text: newMessage,
      type: 'message',
      sender: auth?.user?.uid,
    }
    await addDocument(messageColRef, messageData)

    const chatDocRef = getDocRef('chats', currentChat.id)
    const chatData = {
      latestMessage: newMessage,
    }
    await updateDocument(chatDocRef, chatData)
    setMessage('')
  }, [message])

  const handleUploadFile = useCallback(async (file) => {
    try {
      // console.log(file)

      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        antdMessage.error('You can only upload JPG/PNG file!')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        antdMessage.error('Image must smaller than 2MB!')
        return false
      }

      uploadStorageBytesResumable(
        file,
        null,
        null,
        async ({ downloadURL: file, url }) => {
          // setDownloadURL(downloadURL)

          const newMessage = `${auth?.user?.username} sent a photo`
          const messageColRef = getColRef('chats', currentChat.id, 'messages')
          const messageData = {
            message: newMessage,
            type: 'photo',
            file,
            url,
            sender: auth?.user?.uid,
          }
          await addDocument(messageColRef, messageData)

          const chatDocRef = getDocRef('chats', currentChat.id)
          const chatData = {
            latestMessage: String(newMessage).trim(),
          }
          await updateDocument(chatDocRef, chatData)
        }
      )
      return false
    } catch (error) {
      antdMessage.error(error.message)
    } finally {
    }
  }, [])

  const handleSendLove = useCallback(async () => {
    const newMessage = `${auth?.user?.username} sent a heart`
    const messageColRef = getColRef('chats', currentChat.id, 'messages')
    const messageData = {
      message: newMessage,
      type: 'heart',
      sender: auth?.user?.uid,
    }
    await addDocument(messageColRef, messageData)

    const chatDocRef = getDocRef('chats', currentChat.id)
    const chatData = {
      latestMessage: String(newMessage).trim(),
    }
    await updateDocument(chatDocRef, chatData)
  }, [])

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
            onPressEnter={debounce(handleSubmit, 200)}
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
            <Upload
              beforeUpload={handleUploadFile}
              showUploadList={false}
              maxCount={1}
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
                icon={<IoImageOutline size={20} color="#767676" />}
              />
            </Upload>

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
