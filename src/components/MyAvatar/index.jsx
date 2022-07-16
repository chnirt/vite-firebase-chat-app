import { Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { avatarPlaceholder } from '../../constants'

export const MyAvatar = ({
  src,
  size = {
    xs: 38,
    sm: 38,
    md: 38,
    lg: 38,
    xl: 38,
    xxl: 38,
  },
}) => {
  return (
    <Avatar
      shape="circle"
      size={size}
      icon={<UserOutlined color="#eeeeee" />}
      src={src ?? avatarPlaceholder}
    />
  )
}
