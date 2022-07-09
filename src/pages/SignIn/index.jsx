import { Fragment, useCallback } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Col,
  Form,
  Input,
  notification,
  Row,
  Typography,
} from 'antd'
import { t } from 'i18next'

import { auth } from '../../firebase'
import { eventNames, paths } from '../../constants'
import { logAnalyticsEvent } from '../../firebase/analytics'
import { APP_NAME } from '../../env'
import { signInAccount } from '../../mock'
import { ReactComponent as Logo } from '../../assets/logo/logo-logomark.svg'
import { useLoading } from '../../context'

const SignIn = () => {
  let navigate = useNavigate()
  const loading = useLoading()
  // const [email, setEmail] = useState('trinhchinchin@gmail.com')
  // const [password, setPassword] = useState('Admin@123')
  // const [error, setError] = useState(null)

  // const handleLogin = useCallback(async () => {
  //   try {
  //     if (email === '') return
  //     if (password === '') return

  //     await signInWithEmailAndPassword(auth, email, password)

  //     logAnalyticsEvent(eventNames, { email })
  //   } catch (err) {
  //     setError(err.message)
  //   }
  // }, [email, password, signInWithEmailAndPassword, logAnalyticsEvent])

  const onFinish = useCallback(async (values) => {
    loading.show()
    // console.log('Success:', values)
    const { emailOrYourPhoneNumber: email, password } = values
    try {
      await signInWithEmailAndPassword(auth, email, password)

      logAnalyticsEvent(eventNames.login, { email })
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

  const navigateRegister = useCallback(() => {
    navigate(`../${paths.register}`)
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
                {t('src.screens.login.SIWSTGS', {
                  appName: APP_NAME,
                })}
              </Typography.Text>
            </Row>
            <Form
              style={{ padding: '0 5vw' }}
              name="login-basic"
              className="login-form"
              initialValues={{
                emailOrYourPhoneNumber: signInAccount.emailOrYourPhoneNumber,
                password: signInAccount.password,
                // remember: signInAccount.remember,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
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
                    {t('src.screens.login.Continue')}
                  </Button>
                </div>
              </Form.Item>

              {/* <div
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
                  <Checkbox>{t('src.screens.login.KMSI')}</Checkbox>
                </Form.Item>
              </div> */}
            </Form>
          </Row>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              height: '5vh',
            }}
          >
            <Button onClick={navigateRegister} type="link">
              {t('src.screens.login.NOS', {
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
  //     SignIn
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
  //     <button onClick={handleLogin}>Sign In</button>
  //     <br />
  //     No account? <Link to="/register">Sign up</Link>
  //   </div>
  // )
}

export default SignIn
