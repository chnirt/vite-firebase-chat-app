import { useCallback } from 'react'
import { Button, Row, Typography } from 'antd'

import { useAuth } from '../../context'
import { FiEdit } from 'react-icons/fi'

export const ChatListHeader = () => {
  const auth = useAuth()

  const handleCreateChat = useCallback(() => { }, [])

  return (
    <Row
      style={{
        height: 59,
        padding: '0 20px',
        borderBottom: '1px solid #F0F0F0',
      }}
      align="middle"
      justify="space-between"
    >
      <Typography.Title
        style={{
          marginLeft: '14px',
          marginBottom: 0,
        }}
        level={5}
      >
        {auth?.user?.username}
      </Typography.Title>
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
        icon={<FiEdit size={20} color="#767676" />}
        onClick={handleCreateChat}
      />
    </Row>
  )
}
