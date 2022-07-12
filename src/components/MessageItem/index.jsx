import { Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'

import { Bubble } from '../../components'
import { avatarPlaceholder } from '../../constants'

export const MessageItem = ({ message }) => {
  const { isSender, avatar, text, createdAt } = message

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isSender ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        marginBottom: 8,
      }}
    >
      {!isSender && (
        <Avatar
          style={{ marginRight: 8, minWidth: 24 }}
          shape="circle"
          size={24}
          icon={<UserOutlined color="#eeeeee" />}
          src={avatar ?? avatarPlaceholder}
        />
      )}
      <Bubble placement={isSender ? 'right' : 'left'} text={text} />
    </div>
  )
}
