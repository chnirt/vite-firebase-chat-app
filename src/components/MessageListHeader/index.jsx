import { Avatar, Button, Col, Row, Typography } from 'antd'
import { useCallback } from 'react'
import { UserOutlined } from '@ant-design/icons'
import { ImInfo } from 'react-icons/im'
import { GiInfo } from 'react-icons/gi'

import { avatarPlaceholder } from '../../constants'
import { useAuth } from '../../context'
import { IoInformationCircleOutline } from 'react-icons/io5'

export const MessageListHeader = ({ currentChat }) => {
  const auth = useAuth()

  const getAvatarAndChatName = (chatDetail) => {
    let avatar
    let chatName

    if (chatDetail?.members?.length <= 2) {
      const chatee = chatDetail?.members.find(
        (member) => member.uid !== auth?.user?.uid
      )
      avatar = chatee.avatar
      chatName = chatee.username
    } else {
      avatar = ''
      chatName = chatDetail?.members
        ?.map((item) => item.username)
        .sort((a, b) => {
          if (a === auth?.user.username) return 1
          if (b === auth?.user.username) return -1
          return 0
        })
        .join(', ')
    }

    return {
      avatar,
      chatName,
    }
  }

  const handleGetInfo = useCallback(() => { }, [])

  const { avatar, chatName } = getAvatarAndChatName(currentChat)

  return (
    <Row
      style={{
        height: 59,
        padding: '0 20px',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: '#F0F0F0',
      }}
      align="middle"
      justify="space-between"
    >
      <Col flex={1}>
        <Row align="middle">
          <Avatar
            shape="circle"
            size={{
              xs: 38,
              sm: 38,
              md: 38,
              lg: 38,
              xl: 38,
              xxl: 38,
            }}
            icon={<UserOutlined color="#eeeeee" />}
            src={avatar ?? avatarPlaceholder}
          />
          {chatName && (
            <Typography.Title
              style={{ marginLeft: '14px', marginBottom: 0 }}
              level={5}
            >
              {chatName}
            </Typography.Title>
          )}
        </Row>
      </Col>
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
        icon={<IoInformationCircleOutline size={20} color="#767676" />}
        onClick={handleGetInfo}
      />
    </Row>
  )
}
