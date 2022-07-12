import { Avatar, Col, Row, Typography } from 'antd'
import { getDocs, query, where } from 'firebase/firestore'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { UserOutlined } from '@ant-design/icons'

import { useAuth } from '../../context'
import { getColRef } from '../../firebase/service'
import { avatarPlaceholder } from '../../constants'

export const ChatItem = ({ chat, handleJoinChat = () => { } }) => {
  const { user } = useAuth()
  const [chatDetail, setChatDetail] = useState(null)

  const getAvatarAndChatName = (chatDetail) => {
    let avatar
    let chatName

    if (chatDetail?.members?.length <= 2) {
      const chatee = chatDetail?.members.find(
        (member) => member.uid !== user.uid
      )
      avatar = chatee.avatar
      chatName = chatee.username
    } else {
      avatar = ''
      chatName = chatDetail?.members
        ?.map((item) => item.username)
        .sort((a, b) => {
          if (a === user.username) return 1
          if (b === user.username) return -1
          return 0
        })
        .join(', ')
    }

    return {
      avatar,
      chatName,
    }
  }

  useEffect(() => {
    const fetchChatDetail = async () => {
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
    }
    fetchChatDetail()
  }, [chat])

  if (!chatDetail) return null

  const id = chat.id
  const latestMessage = chat.latestMessage
  const updatedAt = moment(chat.updatedAt?.toDate()).fromNow()
  const { avatar, chatName } = getAvatarAndChatName(chatDetail)

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
          src={avatar ?? avatarPlaceholder}
        />
      </Col>
      <Col span={19}>
        <Typography.Paragraph style={{ marginBottom: 0 }} strong ellipsis>
          {chatName}
        </Typography.Paragraph>
        {latestMessage && (
          <Row>
            <Typography.Paragraph
              style={{
                flex: 1,
                marginTop: 8,
                paddingBottom: 0,
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
