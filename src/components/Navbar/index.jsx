import { useCallback, useMemo } from 'react'
import { Avatar, Badge, Button, Col, Dropdown, Menu, Row } from 'antd'
import { CgBookmark, CgProfile } from 'react-icons/cg'
import {
  IoChatbubbleEllipsesOutline,
  IoHomeOutline,
  IoSettingsOutline,
  IoLogoBitcoin,
} from 'react-icons/io5'
import {
  AiOutlineCompass,
  AiOutlinePlusSquare,
  AiOutlineWallet,
} from 'react-icons/ai'
import { FiHeart } from 'react-icons/fi'
import { UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next'

import { MyAutoComplete } from '../MyAutoComplete'
import { useAuth, useLoading } from '../../context'
import { ReactComponent as Logo } from '../../assets/logo/logo-standard.svg'
import { avatarPlaceholder, paths } from '../../constants'
import { useLocalStorage } from '../../hooks'
import { signOutFirebase } from '../../firebase/service'
import { Global } from '../../global'

export const Navbar = () => {
  let navigate = useNavigate()
  const loading = useLoading()
  const auth = useAuth()
  const [, , removeToken] = useLocalStorage('token', '')

  const handleSignOut = useCallback(async () => {
    try {
      loading.show()
      removeToken()
      await signOutFirebase()
    } catch (error) {
    } finally {
      setTimeout(() => {
        loading.hide()
      }, 1000)
    }
  }, [])

  const handleMenuClick = useCallback(
    (e) => {
      switch (e.key) {
        case '0':
          return navigate(`user/${auth?.user?.username}`)
        case '01':
          return navigate(`../${paths.myNFTs}`)
        case '1':
          return navigate(`user/${auth?.user?.username}`)
        case '2':
          return navigate(`../${paths.profile}`)
        case '4':
          return handleSignOut()

        case 'create-0':
          return Global.CreateBlogModal.show()
        case 'create-1':
          return Global.CreateNFTModal.show()
        default:
          return null
      }
    },
    [handleSignOut]
  )

  // const handleVisibleChange = useCallback(() => { }, [])

  const handleCreatePost = useCallback(() => Global.CreateBlogModal.show(), [])

  const handleExplore = useCallback(() => {
    // navigate(paths.myNFTs)
  }, [])

  const navigateHome = useCallback(() => {
    navigate(paths.blog)
  }, [])

  const navigateBlog = useCallback(() => {
    navigate(paths.blog)
  }, [])

  const navigateChat = useCallback(() => {
    navigate(paths.messenger)
  }, [])

  const navigateNftMarketplace = useCallback(() => {
    navigate(paths.nftMarketplace)
  }, [])

  const handleShowNotification = useCallback(() => {
    // navigate(paths.profile)
    Global.CreateNFTModal.show()
  }, [])

  const tText = {
    profile: t('src.components.Navbar.profile'),
    myNFTs: t('src.components.Navbar.myNFTs'),
    saved: t('src.components.Navbar.saved'),
    setting: t('src.components.Navbar.setting'),
    logout: t('src.components.Navbar.logout'),
    cnp: t('src.components.Navbar.cnp'),
    cnnft: t('src.components.Navbar.cnnft'),
  }

  const items = useMemo(
    () => [
      {
        key: '0',
        label: tText.profile,
        icon: <CgProfile color="#767676" size={16} />,
      },
      {
        key: '01',
        label: tText.myNFTs,
        icon: <IoLogoBitcoin color="#767676" size={16} />,
      },
      {
        key: '1',
        label: tText.saved,
        icon: <CgBookmark color="#767676" size={16} />,
      },
      {
        key: '2',
        label: tText.setting,
        icon: <IoSettingsOutline color="#767676" size={16} />,
      },
      {
        key: '3',
        type: 'divider',
      },
      {
        key: '4',
        label: tText.logout,
      },
    ],
    []
  )

  const createItems = useMemo(
    () => [
      {
        key: 'create-0',
        label: tText.cnp,
        // icon: <CgProfile color="#767676" size={16} />,
      },
      {
        key: 'create-1',
        label: tText.cnnft,
        // icon: <CgBookmark color="#767676" size={16} />,
      },
    ],
    []
  )

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

  const createMenu = (
    <Menu
      style={{
        width: '200px',
        borderRadius: '0.5rem',
      }}
      onClick={handleMenuClick}
      items={createItems}
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

          <Col xs={0} sm={6}>
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
            sm={{ offset: 2, span: 8 }}
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
              icon={<IoHomeOutline size={20} color="#767676" />}
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
                <Badge size="small" count={9} overflowCount={99} dot>
                  <IoChatbubbleEllipsesOutline size={20} color="#767676" />
                </Badge>
              }
              onClick={navigateChat}
            />
            {/* <Button
              style={{
                border: 0,
                boxShadow: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              ghost
              shape="circle"
              icon={<AiOutlinePlusSquare size={20} color="#767676" />}
              onClick={handleCreatePost}
            /> */}
            <Dropdown
              overlay={createMenu}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
              trigger={['click']}
            // arrow={false}
            // onVisibleChange={handleVisibleChange}
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
                icon={<AiOutlinePlusSquare size={20} color="#767676" />}
              />
            </Dropdown>
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
              icon={<AiOutlineWallet size={20} color="#767676" />}
              onClick={navigateNftMarketplace}
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
              icon={<AiOutlineCompass size={20} color="#767676" />}
              onClick={handleExplore}
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
              icon={<FiHeart size={20} color="#767676" />}
              onClick={handleShowNotification}
            />
            <Dropdown
              overlay={menu}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
              trigger={['click']}
            // arrow={false}
            // onVisibleChange={handleVisibleChange}
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
                  size={20}
                  icon={<UserOutlined color="#eeeeee" />}
                  src={auth?.user?.avatar ?? avatarPlaceholder}
                />
              </Button>
            </Dropdown>
          </Col>
        </Col>
      </Row>
    </Row>
  )
}
