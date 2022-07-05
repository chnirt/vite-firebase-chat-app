import { useCallback, useState } from 'react'

import { ChatList, MessageList } from '../../components'

const Messenger = () => {
  const [currentChat, setCurrentChat] = useState(null)

  const joinChat = useCallback((doc) => setCurrentChat(doc), [])

  const leaveChat = useCallback(() => setCurrentChat(null), [])

  return (
    <div>
      <div>Messenger</div>
      <div
        style={{
          height: 500,
          display: 'flex',
          flexDirection: 'row',
          border: 'solid 1px black',
          overflow: 'hidden',
        }}
      >
        <ChatList handleJoinChat={joinChat} />
        <MessageList currentChat={currentChat} />
      </div>
    </div>
  )
}

export default Messenger
