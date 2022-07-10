import { Fragment, useCallback } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { getDocs, query, where } from 'firebase/firestore'
import { Button, Col, Form, Input, notification, Row, Typography } from 'antd'
import { t } from 'i18next'

import { auth } from '../../firebase'
// import { Loading } from '../../components'
import { addDocument, getColRef, getDocRef } from '../../firebase/service'
import { avatarPlaceholder, eventNames, paths } from '../../constants'
import { logAnalyticsEvent } from '../../firebase/analytics'
import { generateKeywords } from '../../firebase/utils'
import { ReactComponent as Logo } from '../../assets/logo/logo-logomark.svg'
import { APP_NAME } from '../../env'
import { signUpAccount } from '../../mock'
import { useLoading } from '../../context'

const SignUp = () => {
  let navigate = useNavigate()
  const loading = useLoading()
  // const [avatar, setAvatar] = useState(
  //   'https://server-avatar.nimostatic.tv/201902231550916212700_1659511695712_avatar.png'
  // )
  // const [username, setUsername] = useState('trinhchinchin')
  // const [email, setEmail] = useState('trinhchinchin@gmail.com')
  // const [password, setPassword] = useState('Admin@123')
  // const [error, setError] = useState(null)

  // const handleRegister = useCallback(async () => {
  //   try {
  //     if (username === '') return
  //     if (email === '') return
  //     if (password === '') return

  //     const q = query(getColRef('users'), where('username', '==', username))
  //     const querySnapshot = await getDocs(q)
  //     const docs = querySnapshot.docs
  //     const data = docs.map((docSnapshot) => {
  //       return {
  //         id: docSnapshot.id,
  //         ...docSnapshot.data(),
  //       }
  //     })
  //     const foundUser = data[0]
  //     if (foundUser) {
  //       throw Error('Username already exists!')
  //     }

  //     const userCredential = await createUserWithEmailAndPassword(
  //       auth,
  //       email,
  //       password
  //     )

  //     if (userCredential) {
  //       const uid = userCredential.user.uid
  //       const userDocRef = getDocRef('users', uid)
  //       const userData = {
  //         uid,
  //         email,
  //         avatar,
  //         username,
  //         keywords: generateKeywords(email),
  //       }
  //       await addDocument(userDocRef, userData)

  //       const followingData = {
  //         type: 'owner',
  //         uid,
  //         avatar,
  //         username,
  //       }
  //       const followerDocRef = getDocRef('users', uid, 'following', uid)
  //       await addDocument(followerDocRef, followingData)
  //     }

  //     logAnalyticsEvent(eventNames.register, {
  //       email,
  //     })
  //   } catch (err) {
  //     setError(err.message)
  //   }
  // }, [
  //   email,
  //   password,
  //   avatar,
  //   username,
  //   createUserWithEmailAndPassword,
  //   addDocument,
  //   logAnalyticsEvent,
  // ])

  const onFinish = useCallback(async (values) => {
    loading.show()
    // console.log('Success:', values)
    const {
      fullName,
      emailOrYourPhoneNumber: email,
      username,
      password,
    } = values
    try {
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
      if (foundUser) {
        throw Error('Username already exists!')
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (userCredential) {
        const uid = userCredential.user.uid
        const userDocRef = getDocRef('users', uid)
        const userData = {
          uid,
          fullName,
          email,
          username,
          avatar: avatarPlaceholder,
          keywords: generateKeywords(email),
        }
        await addDocument(userDocRef, userData)

        const followingData = {
          type: 'owner',
          uid,
          avatar: avatarPlaceholder,
          username,
        }
        const followerDocRef = getDocRef('users', uid, 'following', uid)
        await addDocument(followerDocRef, followingData)
      }

      logAnalyticsEvent(eventNames.register, {
        email,
      })
    } catch (error) {
      // console.log(error.message)
      notification['error']({
        message: 'Register Error',
        description: error.message,
        onClick: () => {
          // console.log('Notification Clicked!')
        },
        placement: 'bottomRight',
      })
    } finally {
      setTimeout(() => {
        loading.hide()
      }, 1000)
    }
  }, [])

  const onFinishFailed = useCallback((errorInfo) => {
    // console.log('Failed:', errorInfo)
  }, [])

  const navigateLogin = useCallback(() => {
    navigate(`../${paths.login}`)
  }, [])

  return (
    <Fragment>
      <Row className="appHeight">
        <Col
          xs={24}
          sm={{ span: 8, offset: 8 }}
          md={{ span: 12, offset: 6 }}
          lg={{ span: 8, offset: 8 }}
          xl={{ span: 6, offset: 9 }}
        >
          <Row
            style={{
              height: '95%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Row
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: '10%',
                marginBottom: '1rem',
              }}
            >
              {/* <FadeIn> */}
              <Logo
                width={50}
                height={68}
                // fill={PRIMARY_COLOR}
              />
              {/* </FadeIn> */}
            </Row>
            <Row style={{ justifyContent: 'center' }}>
              <Typography.Title level={2}>
                {/* <SlideLeft>SendBird Messenger</SlideLeft> */}
                {APP_NAME} Messenger
              </Typography.Title>
            </Row>
            <Row
              style={{
                justifyContent: 'center',
                height: '5%',
              }}
            >
              <Typography.Text>
                {t('src.screens.register.WEONCPUTRY')}
              </Typography.Text>
            </Row>
            <Form
              style={{ padding: '0 5vw' }}
              name="register-basic"
              className="login-form"
              initialValues={{
                fullName: signUpAccount.fullName,
                emailOrYourPhoneNumber: signUpAccount.emailOrYourPhoneNumber,
                username: signUpAccount.username,
                password: signUpAccount.password,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                name="fullName"
                rules={[
                  {
                    required: true,
                    message: 'Please input your full name!',
                  },
                ]}
              >
                <Input placeholder="Full name" />
              </Form.Item>
              <Form.Item
                name="emailOrYourPhoneNumber"
                rules={[
                  {
                    type: 'email',
                    message: 'The input is not valid E-mail!',
                  },
                  {
                    required: true,
                    message: 'Please input Email or Your phone number!',
                  },
                ]}
              >
                <Input placeholder="Email or your phone number" />
              </Form.Item>
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: 'Please input your Username!',
                  },
                ]}
              >
                <Input placeholder="Username" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Please input your Password!',
                  },
                ]}
              >
                <Input type="password" placeholder="Password" />
              </Form.Item>

              <Form.Item>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Button type="link" htmlType="submit">
                    {t('src.screens.register.CA')}
                  </Button>
                </div>
              </Form.Item>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Form.Item
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                  name="remember"
                  valuePropName="checked"
                  noStyle
                >
                  <div
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    {t('src.screens.register.BCYAITYATT')}
                    {/* <a href="https://sendbird.com/support-policy"> */}
                    <a href="https://firebase.google.com/support/privacy">
                      {t('src.screens.register.PP')}
                    </a>
                    {t('src.screens.register.And')}
                    {/* <a href="https://sendbird.com/support-policy"> */}
                    <a href="https://firebase.google.com/terms">
                      {t('src.screens.register.Terms')}
                    </a>
                  </div>
                </Form.Item>
              </div>
            </Form>
          </Row>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              height: '5vh',
            }}
          >
            <Button onClick={navigateLogin} type="link">
              {t('src.screens.register.LWS', {
                appName: APP_NAME,
              })}
            </Button>
          </div>
        </Col>
      </Row>
    </Fragment>
  )

  // return (
  //   <div className="App">
  //     SignUp
  //     <br />
  //     <input
  //       type="text"
  //       placeholder="avatar"
  //       value={avatar}
  //       onChange={(e) => setAvatar(e.target.value)}
  //     />
  //     <br />
  //     <img
  //       style={{
  //         width: 100,
  //         height: 100,
  //       }}
  //       src={avatar}
  //       alt={'avatar'}
  //     />
  //     <br />
  //     <input
  //       type="text"
  //       placeholder="username"
  //       value={username}
  //       onChange={(e) => setUsername(e.target.value)}
  //     />
  //     <br />
  //     <input
  //       type="email"
  //       placeholder="email"
  //       value={email}
  //       onChange={(e) => setEmail(e.target.value)}
  //     />
  //     <br />
  //     <input
  //       type="password"
  //       placeholder="password"
  //       security="true"
  //       value={password}
  //       onChange={(e) => setPassword(e.target.value)}
  //     />
  //     <br />
  //     {error && <p>{error}</p>}
  //     <br />
  //     <button onClick={handleRegister}>Sign Up</button>
  //     <br />
  //     Have an account? <Link to="/">Sign in</Link>
  //   </div>
  // )
}

export default SignUp
