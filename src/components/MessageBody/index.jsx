import moment from 'moment'
import React from 'react'

import { useAuth } from '../../context'

const MessageBody = ({ messages = [] }) => {
  const { user } = useAuth()

  if (messages.length === 0) return <div>No messages</div>

  return (
    <div>
      MessageBody
      {messages.length > 0 &&
        messages.map((message, mi) => {
          const sender = user.uid === message.sender
          const id = message.id
          const text = message.text
          const createdAt = message.createdAt

          return (
            <div
              key={`message-${mi}`}
              style={{
                display: 'flex',
                justifyContent: sender ? 'flex-end' : 'flex-start',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: sender ? 'row-reverse' : 'row',
                }}
              >
                <img
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 20 / 2,
                  }}
                  src={message.senderPhotoURL}
                  alt={id}
                />
                {/* <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: sender ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {text}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: sender ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {moment(createdAt?.toDate()).fromNow()}
                  </div>
                </div> */}
              </div>
            </div>
          )
        })}
    </div>
  )
}

export default MessageBody
