import ChatList from '../../components/ChatLIst'
import MessageList from '../../components/MessageList'

const Messenger = () => {
  return (
    <div>
      <div>Messenger</div>
      <div
        style={{
          height: 500,
          display: 'flex',
          flexDirection: 'row',
          // overflowY: 'scroll',
          // paddingTop: 8,
          // paddingBottom: 8,
          border: 'solid 1px black',
          overflow: 'hidden',
        }}
      >
        <div>
          <ChatList />
        </div>
        <div
          style={{
            flex: 4,
            border: 'solid 1px black',
          }}
        >
          <MessageList />
        </div>
      </div>
    </div>
  )
}

export default Messenger
