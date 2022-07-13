import { Avatar, Image } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { FiHeart } from 'react-icons/fi'

import { Bubble } from '../../components'
import { avatarPlaceholder } from '../../constants'

export const MessageItem = ({ message }) => {
  const { isSender, avatar, text, createdAt, type, file } = message

  const isMessage = type === 'message'
  const isHeart = type === 'heart'
  const isPhoto = type === 'photo'

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
      {isMessage && (
        <Bubble placement={isSender ? 'right' : 'left'} text={text} />
      )}
      {isHeart && <FiHeart size={20} color="#ff4d4f" fill="#ff4d4f" />}
      {isPhoto && (
        <Image
          style={{
            // width: 220,
            height: 220,
            borderRadius: 22
          }}
          src={file}
        />
      )}
    </div>
  )
}
