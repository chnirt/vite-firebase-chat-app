import { useCallback } from 'react'
import { Avatar, Badge, Button, Col, Dropdown, Menu, Row } from 'antd'
import { CgBookmark, CgProfile } from 'react-icons/cg'
import {
  IoChatbubbleEllipsesOutline,
  IoHomeOutline,
  IoSettingsOutline,
} from 'react-icons/io5'
import { AiOutlineCompass, AiOutlinePlusSquare } from 'react-icons/ai'
import { FiHeart } from 'react-icons/fi'
import { UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
// import { useRecoilState } from 'recoil'

import { MyAutoComplete } from '../MyAutoComplete'
import { useAuth, useLoading, useModal } from '../../context'
import { ReactComponent as Logo } from '../../assets/logo/logo-standard.svg'
import { paths } from '../../constants'
import { useLocalStorage } from '../../hooks'
import { signOutFirebase } from '../../firebase/service'
// import { modalState } from '../../atoms'
// import { PostCreateForm } from '../PostCreateForm'
// import { savePostToFirestore } from '../../firebase'

export const Navbar = () => {
  let navigate = useNavigate()
  const loading = useLoading()
  const auth = useAuth()
  const modal = useModal()
  const [, , removeToken] = useLocalStorage('token', '')

  const handleSignOut = useCallback(async () => {
    try {
      loading.show()
      signOutFirebase()
      removeToken()
    } catch (error) { }
  }, [])

  const handleMenuClick = useCallback(
    (e) => {
      switch (e.key) {
        case '0':
          return navigate(`user/${auth?.user?.username}`)
        case '1':
          return navigate(`user/${auth?.user?.username}`)
        case '2':
          return navigate(`../${paths.setting}`)
        case '4':
          return handleSignOut()
        default:
          return null
      }
    },
    [handleSignOut]
  )

  const handleVisibleChange = useCallback(() => { }, [])

  const handleCreatePost = useCallback(() => modal.show(), [])

  const onCreate = useCallback(async (values) => {
    loading.show()
    // console.log('Received values of form: ', values)
    try {
      // await savePostToFirestore(values)
    } catch (error) {
    } finally {
      modal.hide()
      modal.form.resetFields()
      loading.hide()
    }
  }, [])

  const onCancel = useCallback(() => modal.hide(), [])

  const navigateHome = useCallback(() => {
    navigate(paths.home)
  }, [navigate])

  const navigateBlog = useCallback(() => {
    navigate(paths.blog)
  }, [navigate])

  const navigateChat = useCallback(() => {
    navigate(paths.messenger)
  }, [navigate])

  const items = [
    {
      key: '0',
      label: 'Profile',
      icon: <CgProfile color="#767676" size={16} />,
    },
    {
      key: '1',
      label: 'Saved',
      icon: <CgBookmark color="#767676" size={16} />,
    },
    {
      key: '2',
      label: 'Setting',
      icon: <IoSettingsOutline color="#767676" size={16} />,
    },
    {
      key: '3',
      type: 'divider',
    },
    {
      key: '4',
      label: 'Log Out',
    },
  ]

  const menu = (
    <Menu
      style={{
        width: '200px',
        borderRadius: '0.5rem',
      }}
      onClick={handleMenuClick}
      items={items}
    />
  )

  return (
    <Row
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        borderBottom: '1px solid #dbdbdb',
        position: 'fixed',
        top: 0,
        background: '#fff',
        zIndex: 20,
      }}
    >
      <Row
        style={{
          height: 60,
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'center',
          maxWidth: 975,
          width: '100%',
        }}
        justify="center"
        align="middle"
      >
        <Col
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
          // span={18}
          xs={24}
          sm={24}
        // md={18}
        // lg={24}
        // xl={24}
        >
          <Col
            style={
              {
                // borderWidth: 1,
                // borderStyle: 'solid',
              }
            }
            xs={8}
          >
            <Button
              style={{
                border: 0,
                boxShadow: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
              ghost
              onClick={navigateHome}
            >
              <Logo
                width={(29 * 938) / 264}
                height={29}
              // fill={PRIMARY_COLOR}
              />
            </Button>
          </Col>

          <Col xs={0} sm={8}>
            <MyAutoComplete />
          </Col>

          <Col
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: '24px',
            }}
            xs={16}
            sm={8}
          >
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
              icon={<IoHomeOutline size={24} color="#767676" />}
              onClick={navigateBlog}
            />
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
              icon={
                <Badge count={9} overflowCount={99}>
                  <IoChatbubbleEllipsesOutline size={24} color="#767676" />
                </Badge>
              }
              onClick={navigateChat}
            />
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
              icon={<AiOutlinePlusSquare size={24} color="#767676" />}
              onClick={handleCreatePost}
            />
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
              icon={<AiOutlineCompass size={24} color="#767676" />}
            />
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
              icon={<FiHeart size={24} color="#767676" />}
            />
            <Dropdown
              overlay={menu}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
              trigger={['click']}
              // arrow={false}
              onVisibleChange={handleVisibleChange}
            >
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
              >
                <Avatar
                  shape="circle"
                  size={24}
                  icon={<UserOutlined color="#eeeeee" />}
                  src={
                    auth?.user?.avatar ??
                    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
                  }
                />
              </Button>
            </Dropdown>
          </Col>
        </Col>
      </Row>

      {/* <PostCreateForm
        form={modal.form}
        visible={modal.visible}
        onCreate={onCreate}
        onCancel={onCancel}
      /> */}
    </Row>
  )
}
