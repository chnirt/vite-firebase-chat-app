import { Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'

export const MyAvatar = ({ src }) => {
  return (
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
      src={src ?? avatarPlaceholder}
    />
  )
}
