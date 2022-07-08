import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDocs, query, where } from 'firebase/firestore'
import { Avatar, Button, Col, Row, Tabs, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { IoSettingsOutline } from 'react-icons/io5'
import { MdGridOn } from 'react-icons/md'
import { CgBookmark } from 'react-icons/cg'
import { BiUserPin } from 'react-icons/bi'

import { getColRef } from '../../firebase/service'
import { BackButton, PostList } from '../../components'
import { useAuth } from '../../context'
import { paths } from '../../constants'

const UserDetail = () => {
  let { username } = useParams()
  let navigate = useNavigate()
  const auth = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  const navigateProfile = useCallback(() => {
    navigate(`../${paths.profile}`)
  }, [])

  const navigateSetting = useCallback(() => {
    navigate(`../${paths.setting}`)
  }, [])

  useEffect(() => {
    const fetchData = async (username) => {
      try {
        setLoading(true)

        const q = query(getColRef('users'), where('username', '==', username))
        const querySnapshot = await getDocs(q)
        const docs = querySnapshot.docs
        const data = docs.map((docSnapshot) => {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }
        })
        const foundUser = data[0]

        // console.log(foundUser)
        setUser(foundUser)
      } catch (error) {
        // console.log(error.message)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData(username)
  }, [username])

  if (!user) return null

  return (
    <div style={{ padding: '30px 20px 0px 20px' }}>
      <Row
        style={{
          marginBottom: 44,
        }}
        align="center"
        justify="center"
      >
        <Col
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          // span={18}
          xs={8}
          sm={8}
        // md={18}
        // lg={24}
        // xl={24}
        >
          <Avatar
            shape="circle"
            size={{
              xs: 100,
              sm: 150,
              md: 150,
              lg: 150,
              xl: 150,
              xxl: 150,
            }}
            icon={<UserOutlined color="#eeeeee" />}
            src={
              auth?.user?.avatar ??
              'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
            }
          />
        </Col>
        <Col
          // span={18}
          xs={16}
          sm={16}
        // md={18}
        // lg={24}
        // xl={24}
        >
          <Row
            style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}
          >
            <Typography.Title style={{ marginBottom: 0 }} level={2}>
              trinhchinchin
            </Typography.Title>
            <Button style={{ marginLeft: 20 }} onClick={navigateProfile}>
              Edit profile
            </Button>
            <Button
              style={{
                border: 0,
                boxShadow: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 5,
              }}
              ghost
              shape="circle"
              icon={<IoSettingsOutline color="#767676" size={24} />}
              onClick={navigateSetting}
            />
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Typography.Text style={{ marginRight: 40 }}>
              <Typography.Text strong>0</Typography.Text> posts
            </Typography.Text>
            <Typography.Text style={{ marginRight: 40 }}>
              <Typography.Text strong>165</Typography.Text> followers
            </Typography.Text>
            <Typography.Text>
              <Typography.Text strong>241</Typography.Text> following
            </Typography.Text>
          </Row>
          <Row>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography.Text strong>TrinhChinChin 🦦</Typography.Text>
              <Typography.Text>Hate me first, ❤️ later</Typography.Text>
            </div>
          </Row>
        </Col>
      </Row>
      <Tabs defaultActiveKey="1" centered>
        <Tabs.TabPane
          key="1"
          tab={
            <Row
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <MdGridOn color="#767676" size={16} />
              <Typography.Text style={{ marginLeft: 8 }} strong>
                POSTS
              </Typography.Text>
            </Row>
          }
        >
          <PostList />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="2"
          tab={
            <Row
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <CgBookmark color="#767676" size={16} />
              <Typography.Text style={{ marginLeft: 8 }} strong>
                SAVED
              </Typography.Text>
            </Row>
          }
        >
          <PostList />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="3"
          tab={
            <Row
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <BiUserPin color="#767676" size={16} />
              <Typography.Text style={{ marginLeft: 8 }} strong>
                TAGGED
              </Typography.Text>
            </Row>
          }
        >
          <PostList />
        </Tabs.TabPane>
      </Tabs>
      UserDetail
      <br />
      <BackButton />
      <div>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Document: Loading...</span>}
        {user && (
          <div>
            <h3>{user?.email}</h3>
            <p>{moment(user?.createdAt?.toDate()).fromNow()}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDetail
