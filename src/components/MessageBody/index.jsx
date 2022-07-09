import moment from 'moment'

import { useAuth } from '../../context'

const MessageBody = ({ messageList = [], currentChat = {} }) => {
  const { user } = useAuth()

  if (messageList.length === 0) return <div>No messages</div>
  return (
    <div>
      MessageBody
      {messageList.length > 0 &&
        messageList.map((message, mi) => {
          const sender = user.uid === message.sender
          const id = message.id
          const text = message.text
          const createdAt = message.createdAt
          const avatar = currentChat?.members?.find(member => member.uid === message.sender)?.avatar

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
                  // display: 'flex',
                  // flexDirection: sender ? 'row-reverse' : 'row',
                }}
              >
                <img
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 20 / 2,
                  }}
                  src={avatar}
                  alt={id}
                />
                <div
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
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}

export default MessageBody
