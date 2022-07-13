import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { Avatar, Button, Col, message, Row, Tabs, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { IoSettingsOutline } from 'react-icons/io5'
import { MdGridOn } from 'react-icons/md'
import { CgBookmark } from 'react-icons/cg'
import { BiUserPin } from 'react-icons/bi'

import {
  addDocument,
  deleteDocument,
  getColRef,
  getDocRef,
} from '../../firebase/service'
import { Music, PostList } from '../../components'
import { useAuth, useLoading } from '../../context'
import { avatarPlaceholder, colors, paths } from '../../constants'
import { Global } from '../../global'

const UserDetail = () => {
  let { username } = useParams()
  let navigate = useNavigate()
  const auth = useAuth()
  const appLoading = useLoading()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  const [blogList, setBlogList] = useState([])
  const [followingList, setFollowingList] = useState([])
  const [followerList, setFollowerList] = useState([])

  const isOwner = auth?.user?.username === username
  const isFollowing = followerList.some((item) => item.uid === auth?.user?.uid)
  const backgroundMusic = auth?.user?.backgroundMusic

  const navigateProfile = useCallback(() => {
    navigate(`../${paths.profile}`)
  }, [])

  const navigateSetting = useCallback(() => {
    Global.SettingModal.show()
  }, [])

  const handleFollow = useCallback(async (doc) => {
    try {
      // follower
      // const followerDocRef = getDocRef('users', user.uid)
      const followingData = {
        type: 'followee',
        uid: doc.uid,
        avatar: doc.avatar,
        username: doc.username,
      }
      const followerDocRef = getDocRef(
        'users',
        auth.user.uid,
        'following',
        doc.uid
      )
      await addDocument(followerDocRef, followingData)

      // followee
      // const followeeDocRef = doc.ref
      const followerData = {
        type: 'follower',
        uid: auth.user.uid,
        avatar: auth.user.avatar,
        username: auth.user.username,
      }
      const followeeDocRef = getDocRef(
        'users',
        doc.uid,
        'follower',
        auth.user.uid
      )
      await addDocument(followeeDocRef, followerData)

      // // add relationship
      // const batch = getBatch()
      // const blogDocRef = getColRef('blogs')
      // const getQuery = query(blogDocRef, where('uid', '==', doc.uid))
      // const querySnapshot = await getDocs(getQuery)
      // querySnapshot.forEach((docSnapshot) => {
      //   const docRef = docSnapshot.ref
      //   batch.update(docRef, {
      //     relationship: arrayUnion(user.uid),
      //   })
      // })

      // await batch.commit()
    } catch (error) {
      message.error(error.message)
    } finally {
    }
  }, [])

  const handleUnfollow = useCallback(async (doc) => {
    try {
      // follower
      const followerDocRef = getDocRef(
        'users',
        auth.user.uid,
        'following',
        doc.uid
      )
      const followerDocSnap = await getDoc(followerDocRef)
      // console.log(followerDocSnap.data())
      if (followerDocSnap.exists()) {
        await deleteDocument('users', auth.user.uid, 'following', doc.uid)
      }

      // followee
      const followeeDocRef = getDocRef(
        'users',
        doc.uid,
        'follower',
        auth.user.uid
      )
      const followeeDocSnap = await getDoc(followeeDocRef)
      // console.log(followeeDocSnap.data())
      if (followeeDocSnap.exists()) {
        await deleteDocument('users', doc.uid, 'follower', auth.user.uid)
      }

      // // remove relationship
      // const batch = getBatch()
      // const getQuery = query(getColRef('blogs'), where('uid', '==', doc.uid))
      // const querySnapshot = await getDocs(getQuery)
      // querySnapshot.forEach((docSnapshot) => {
      //   const docRef = docSnapshot.ref
      //   batch.update(docRef, {
      //     relationship: arrayRemove(user.uid),
      //   })
      // })

      // await batch.commit()
    } catch (error) {
      message.error(error.message)
    } finally {
    }
  }, [])

  const handleMessage = useCallback(async (doc) => {
    try {
      const chatData = {
        members: [auth.user.uid, doc.uid],
        uid: auth.user.uid,
      }
      const q = query(
        getColRef('chats'),
        where('members', 'in', [chatData.members])
      )
      const querySnapshot = await getDocs(q)
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      const foundChat = data[0]
      if (!foundChat) {
        const chatDocRef = getColRef('chats')
        await addDocument(chatDocRef, chatData)
      }
      navigate(`../${paths.messenger}`)
    } catch (error) {
      message.error(error.message)
    } finally {
    }
  }, [])

  useEffect(() => {
    const fetchData = async (username) => {
      try {
        appLoading.show()

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
        setTimeout(() => {
          appLoading.hide()
        }, 1000)
      }
    }

    fetchData(username)
  }, [username])

  useEffect(() => {
    if (!user) return

    const fetchBlogData = async () => {
      const blogDocRef = getColRef('blogs')
      const q = query(blogDocRef, where('uid', '==', user.uid))
      const querySnapshot = await getDocs(q)
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      // console.log(data)
      setBlogList(data)
    }
    const fetchFollowingData = async () => {
      const followingDocRef = getColRef('users', user.uid, 'following')
      const q = query(followingDocRef, where('uid', '!=', user.uid))
      const querySnapshot = await getDocs(q)
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      // console.log(data)
      setFollowingList(data)
    }
    const fetchFollowerData = async () => {
      const followerDocRef = getColRef('users', user.uid, 'follower')
      const querySnapshot = await getDocs(followerDocRef)
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      // console.log(data)
      setFollowerList(data)
    }
    // const fetchLikeData = async () => {
    //   const likeDocRef = getColRef('users', user.uid, 'likes')
    //   const querySnapshot = await getDocs(likeDocRef)
    //   const docs = querySnapshot.docs
    //   const data = docs.map((docSnapshot) => {
    //     return {
    //       id: docSnapshot.id,
    //       ...docSnapshot.data(),
    //     }
    //   })
    //   // console.log(data)
    //   setLikeList(data)
    // }
    appLoading.show()
    Promise.all([
      fetchBlogData(),
      fetchFollowingData(),
      fetchFollowerData(),
      // fetchLikeData(),
    ]).then(() => {
      setTimeout(() => {
        appLoading.hide()
      }, 1000)
    })
  }, [user])

  useEffect(() => {
    if (!user) return
    const followerDocRef = getColRef('users', user.uid, 'follower')
    const q = query(followerDocRef, where('uid', '!=', user.uid))
    const unsubscribeFollowing = onSnapshot(
      q,
      async (querySnapshot) => {
        const data = querySnapshot.docs.map((docSnapshot) => {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }
        })
        setFollowerList(data)
      },
      (error) => {
        console.log(error)
      }
    )
    return () => {
      unsubscribeFollowing()
    }
  }, [user])

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
            src={user?.avatar ?? avatarPlaceholder}
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
              {user.username}
            </Typography.Title>
            {isOwner ? (
              <Button
                style={{
                  borderColor: '#767676',
                  color: '#767676',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 20,
                }}
                onClick={navigateProfile}
              >
                Edit profile
              </Button>
            ) : isFollowing ? (
              <div>
                <Button
                  style={{
                    borderColor: '#767676',
                    color: '#767676',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 20,
                  }}
                  onClick={() => handleMessage(user)}
                >
                  Message
                </Button>
                <Button
                  style={{
                    borderColor: '#767676',
                    color: '#767676',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 20,
                    borderRadius: 3,
                    paddingLeft: 24,
                    paddingRight: 24,
                  }}
                  onClick={() => handleUnfollow(user)}
                >
                  Following
                </Button>
              </div>
            ) : (
              <Button
                style={{
                  backgroundColor: '#0095F6',
                  borderColor: '#0095F6',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 20,
                  borderRadius: 3,
                  paddingLeft: 24,
                  paddingRight: 24,
                }}
                type="primary"
                onClick={() => handleFollow(user)}
              >
                Follow
              </Button>
            )}

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
              <Typography.Text strong>{blogList.length}</Typography.Text> posts
            </Typography.Text>
            <Typography.Text style={{ marginRight: 40 }}>
              <Typography.Text strong>{followerList.length}</Typography.Text>{' '}
              followers
            </Typography.Text>
            <Typography.Text>
              <Typography.Text strong>{followingList.length}</Typography.Text>{' '}
              following
            </Typography.Text>
          </Row>
          <Row
            style={{
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography.Text strong>{user.fullName}</Typography.Text>
              <Typography.Text>{user.bio}</Typography.Text>
            </div>
          </Row>
          {backgroundMusic && (
            <Row
              style={{
                padding: '16px 16px 0 16px',
                borderRadius: 16,
                backgroundImage: `linear-gradient(0deg, #ffffff, ${colors.firebase}30)`,
              }}
            >
              <Music
                // ref={musicRef}
                data={[backgroundMusic]}
                // onStateChange={handleStateChange}
                autoplay
              />
            </Row>
          )}
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
          <PostList data={blogList} />
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
          <PostList data={blogList} />
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
          <PostList data={blogList} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  )

  // return (
  //   <div>
  //     UserDetail
  //     <br />
  //     <BackButton />
  //     <div>
  //       {error && <strong>Error: {JSON.stringify(error)}</strong>}
  //       {loading && <span>Document: Loading...</span>}
  //       {user && (
  //         <div>
  //           <h3>{user?.email}</h3>
  //           <p>{moment(user?.createdAt?.toDate()).fromNow()}</p>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // )
}

export default UserDetail
