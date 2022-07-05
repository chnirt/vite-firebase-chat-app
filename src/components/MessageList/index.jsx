import React from 'react'

const MessageList = ({ currentChat }) => {
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
        border: 'solid 1px black',
        overflowY: 'scroll',
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      MessageList
    </div>
  )
}

export default MessageList
