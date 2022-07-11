import { Col, Row } from 'antd'
import { Fragment, useCallback, useState } from 'react'

import { ChatList, MessageList } from '../../components'

const Messenger = () => {
  const [currentChat, setCurrentChat] = useState(null)

  const joinChat = useCallback((doc) => setCurrentChat(doc), [])

  const leaveChat = useCallback(() => setCurrentChat(null), [])

  return (
    <Fragment>
      <div
        style={{
          height: 'calc(var(--app-height) - 90px)',
          overflow: 'auto',
          // padding: '0 16px',
          border: '1px solid rgba(140, 140, 140, 0.35)',
          borderRadius: 3,
        }}
      >
        <Row
          style={{
            height: '100%',
          }}
        >
          <Col span={10}>
            <ChatList handleJoinChat={joinChat} />
          </Col>
          <Col span={14}>
            <MessageList currentChat={currentChat} />
          </Col>
        </Row>
      </div>
    </Fragment>
  )

  // return (
  //   <div>
  //     <div>Messenger</div>
  //     <div
  //       style={{
  //         height: 500,
  //         display: 'flex',
  //         flexDirection: 'row',
  //         border: 'solid 1px black',
  //         overflow: 'hidden',
  //       }}
  //     >
  //       <ChatList handleJoinChat={joinChat} />
  //       <MessageList currentChat={currentChat} />
  //     </div>
  //   </div>
  // )
}

export default Messenger
