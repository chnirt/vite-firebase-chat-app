import { Avatar, Col, Row, Typography } from 'antd'
import { getDocs, query, where } from 'firebase/firestore'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { UserOutlined } from '@ant-design/icons'

import { useAuth } from '../../context'
import { getColRef } from '../../firebase/service'
import { avatarPlaceholder } from '../../constants'
import { useCallback } from 'react'

export const ChatItem = ({ chat, handleJoinChat = () => { } }) => {
  const auth = useAuth()
  const [chatDetail, setChatDetail] = useState(null)

  const getAvatarAndChatName = (chatDetail) => {
    let avatars
    let chatNames

    const otherMembers = chatDetail?.members?.filter(
      (member) => member.uid !== auth?.user?.uid
    )
    avatars = otherMembers?.map((member) => member.avatar)
    chatNames = otherMembers?.map((member) => member.username)

    return {
      avatars,
      chatNames,
    }
  }

  const fetchChatDetail = useCallback(async () => {
    const userDocRef = getColRef('users')
    const q = query(userDocRef, where('uid', 'in', chat.members))
    const querySnapshot = await getDocs(q)
    const docs = querySnapshot.docs
    const data = docs.map((docSnapshot) => {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }
    })
    setChatDetail({
      ...chat,
      members: data,
    })
  }, [chat])

  useEffect(() => {
    fetchChatDetail()
  }, [fetchChatDetail])

  if (!chatDetail) return null

  const id = chat.id
  const latestMessage = chat.latestMessage
  const updatedAt = moment(chat.updatedAt?.toDate()).fromNow()
  const { avatars, chatNames } = getAvatarAndChatName(chatDetail)

  return (
    <Row
      style={{
        padding: '8px 20px',
        width: '100%',
        cursor: 'pointer',
      }}
      onClick={() => handleJoinChat(chatDetail)}
    >
      <Col span={5}>
        <Avatar
          style={{ marginRight: 12, minWidth: 56 }}
          shape="circle"
          size={56}
          icon={<UserOutlined color="#eeeeee" />}
          src={avatars[0] ?? avatarPlaceholder}
        />
      </Col>
      <Col span={19}>
        <Typography.Paragraph style={{ marginBottom: 0 }} strong ellipsis>
          {chatNames.join(', ')}
        </Typography.Paragraph>
        {latestMessage && (
          <Row align="middle" justify="start">
            <Typography.Paragraph
              style={{
                marginTop: 8,
                paddingBottom: 0,
                maxWidth: 150,
              }}
              ellipsis
            >
              {latestMessage}
            </Typography.Paragraph>
            <Typography.Paragraph
              style={{
                marginTop: 8,
                paddingBottom: 0,
                marginLeft: 4,
                marginRight: 4,
              }}
            >
              ·
            </Typography.Paragraph>
            <Typography.Paragraph
              style={{
                marginTop: 8,
                paddingBottom: 0,
              }}
            >
              {updatedAt}
            </Typography.Paragraph>
          </Row>
        )}
      </Col>
    </Row>
  )

  // return (
  //   <div
  //     key={`chat-${id}`}
  //     style={{
  //       border: 'solid 1px black',
  //       margin: 8,
  //       // display: 'flex',
  //       // flexDirection: 'row',
  //       // justifyContent: 'center',
  //       alignItems: 'center',
  //     }}
  //   >
  //     <p
  //       style={{
  //         textOverflow: 'ellipsis',
  //         whiteSpace: 'nowrap',
  //         overflow: 'hidden',
  //         width: 200,
  //       }}
  //     >
  //       {chatName}
  //     </p>
  //     <p>{latestMessage}</p>
  //     <p>{moment(updatedAt?.toDate()).fromNow()}</p>
  //     <button onClick={() => handleJoinChat(chatDetail)}>Join</button>
  //   </div>
  // )
}
