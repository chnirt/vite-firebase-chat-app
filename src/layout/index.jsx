import { signOut } from 'firebase/auth'
import { Fragment, useCallback } from 'react'
import { Col, Row } from 'antd'

import { useLoading } from '../context'
import { auth } from '../firebase'
import { useLocalStorage } from '../hooks'
import { Navbar } from '../components'
import { Link } from 'react-router-dom'
// import { colors } from '../constants'

const LinkRoutes = [
  {
    path: '/',
    name: 'Home',
  },
  {
    path: '/blog',
    name: 'Blog',
  },
  {
    path: '/whatsapp',
    name: 'WhatsApp',
  },
  {
    path: '/pexels',
    name: 'Pexels',
  },
  {
    path: '/search',
    name: 'Search',
  },
  {
    path: '/messenger',
    name: 'Messenger',
  },
  {
    path: '/audioPlayer',
    name: 'Audio Player',
  },
  {
    path: '/profile',
    name: 'Profile',
  },
  {
    path: '/change-password',
    name: 'Change Password',
  },
  {
    path: '/nft-marketplace',
    name: 'NFT Marketplace',
  },
  {
    path: '/create-nft',
    name: 'Create NFT',
  },
  {
    path: '/my-nfts',
    name: 'My NFTs',
  },
]

export const Layout = ({ children }) => {
  // const { user } = useAuth()
  const loading = useLoading()
  const [, , removeToken] = useLocalStorage('token', '')

  const handleLogout = useCallback(() => {
    loading.show()
    signOut(auth)
    removeToken()
  }, [])

  return (
    <Fragment>
      <div
      // style={{
      //   backgroundImage: `linear-gradient(0deg, #ffffff, ${colors.firebase}30)`,
      // }}
      >
        <Navbar />
        {/* <div className="App">
          {TITLE}
          <p>Current User: {user.email}</p>
          <button onClick={handleLogout}>Log out</button>
          <ul
            style={{
              overflow: 'hidden',
            }}
          >
            {LinkRoutes.length &&
              LinkRoutes.map((route, ri) => (
                <li
                  style={{ float: 'left', listStyleType: 'none', padding: 8 }}
                  key={`route-${ri}`}
                >
                  <Link to={route.path}>{route.name}</Link>
                </li>
              ))}
          </ul>
        </div> */}

        <div
          className="appHeight"
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Row
            style={{
              width: '100%',
              aspectRatio: 1,
              maxWidth: 975,
              paddingTop: '90px',
              overflow: 'hidden',
            }}
          >
            <Col
              style={{
                alignItems: 'center',
                margin: '0 auto',
                overflow: 'hidden',
              }}
              // span={18}
              xs={24}
              sm={24}
            // md={18}
            // lg={24}
            // xl={24}
            >
              {children}
            </Col>
          </Row>
        </div>
      </div>
    </Fragment>
  )
}
