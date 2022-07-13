import { Avatar, Button, Col, Row, Typography } from 'antd'
import { useCallback } from 'react'
import { UserOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { IoInformationCircleOutline } from 'react-icons/io5'

import { avatarPlaceholder } from '../../constants'
import { useAuth } from '../../context'

export const MessageListHeader = ({ currentChat }) => {
  const auth = useAuth()

  const getAvatarAndChatName = (chatDetail) => {
    let avatars
    let usernames

    const otherMembers = chatDetail?.members?.filter(
      (member) => member.uid !== auth?.user?.uid
    )
    avatars = otherMembers?.map((member) => member.avatar)
    usernames = otherMembers?.map((member) => member.username)

    return {
      avatars,
      usernames,
    }
  }

  const handleGetInfo = useCallback(() => { }, [])

  const { avatars, usernames } = getAvatarAndChatName(currentChat)

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
            src={avatars[0] ?? avatarPlaceholder}
          />
          <Row
            style={{
              marginLeft: '14px',
            }}
          >
            {usernames.length > 0 &&
              usernames.map((username, ui) => {
                const isFirst = ui === 0
                return (
                  <Link key={`username-${ui}`} to={`/user/${username}`}>
                    <Typography.Title style={{ marginBottom: 0 }} level={5}>
                      {!isFirst && ','}
                      {username}
                    </Typography.Title>
                  </Link>
                )
              })}
          </Row>
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
