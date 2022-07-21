import { Fragment, useCallback, useEffect, useState } from 'react'
import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  message,
  // notification,
  Row,
  Select,
  Typography,
  Upload,
} from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { getDocs, query, where } from 'firebase/firestore'
import { t } from 'i18next';

import { Language, useAuth, useI18n, useLoading } from '../../context'
import { uploadStorageBytesResumable } from '../../firebase/storage'
import {
  getBatch,
  getColGroupRef,
  getDocRef,
  updateDocument,
} from '../../firebase/service'
import { avatarPlaceholder, eventNames } from '../../constants'
import { logAnalyticsEvent } from '../../firebase/analytics'

export const EditProfile = () => {
  const auth = useAuth()
  const appLoading = useLoading()
  const { language, changeLanguage } = useI18n()
  const [form] = Form.useForm()
  const [, forceUpdate] = useState({}) // To disable submit button at the beginning.
  const [state, setState] = useState(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    forceUpdate({})
  }, [])

  const handleUploadFile = useCallback(async (file) => {
    try {
      appLoading.show()
      // console.log(file)

      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error('Image must smaller than 2MB!')
        return false
      }

      uploadStorageBytesResumable(
        file,
        ({ state, progress }) => {
          setState(state)
          setProgress(progress)
        },
        null,
        async ({ downloadURL: avatar, url }) => {
          // setDownloadURL(downloadURL)

          const userDocRef = getDocRef('users', auth?.user?.uid)
          const userData = {
            avatar,
            url,
          }
          await updateDocument(userDocRef, userData)

          // update following
          const batch = getBatch()
          const followingDocRef = getColGroupRef('following')
          const q = query(followingDocRef, where('uid', '==', auth?.user?.uid))
          const querySnapshot = await getDocs(q)
          querySnapshot.forEach((docSnapshot) => {
            const docRef = docSnapshot.ref
            batch.update(docRef, userData)
          })

          await batch.commit()

          auth?.fetchUser(auth?.user)

          message.success('Avatar updated successfully.')

          logAnalyticsEvent(eventNames.editAvatar, {
            avatar,
            url,
          })
        }
      )
      return false
    } catch (error) {
      message.error(error.message)
    } finally {
      setTimeout(() => {
        appLoading.hide()
      }, 1000)
    }
  }, [])

  const onFinish = useCallback(async (values) => {
    try {
      appLoading.show()
      // console.log('Success:', values)
      const { fullName, bio } = values

      const userDocRef = getDocRef('users', auth.user.uid)
      const userData = {
        fullName,
        bio,
      }
      await updateDocument(userDocRef, userData)

      auth?.fetchUser(auth?.user)

      // notification['success']({
      //   message: 'Successfully',
      //   description: 'Edit profile successfully',
      //   onClick: () => {
      //     // console.log('Notification Clicked!')
      //   },
      //   placement: 'bottomRight',
      // })
      message.success('Edit profile successfully.')

      logAnalyticsEvent(eventNames.editProfile)
    } catch (error) {
      // console.log(error.message)
      // notification['error']({
      //   message: 'Register Error',
      //   description: error.message,
      //   onClick: () => {
      //     // console.log('Notification Clicked!')
      //   },
      //   placement: 'bottomRight',
      // })
      message.error(error.message)
    } finally {
      setTimeout(() => {
        appLoading.hide()
      }, 1000)
    }
  }, [])

  const onFinishFailed = useCallback((errorInfo) => {
    console.log('Failed:', errorInfo)
  }, [])

  const handleChange = useCallback((value) => {
    console.log(`selected ${value}`)
    changeLanguage(value)
  })

  const tText = {
    CPP: t('src.screens.profile.CPP'),
    fullName: t('src.screens.profile.fullName'),
    language: t('src.screens.profile.language'),
    submit: t('src.screens.profile.submit')
  }

  return (
    <Fragment>
      <Row style={{ margin: '32px 32px 0 32px' }}>
        <Col
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          span={6}
        >
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
            src={auth?.user?.avatar ?? avatarPlaceholder}
          />
        </Col>
        <Col span={16} offset={1}>
          <Typography.Title style={{ marginBottom: 0 }} level={3}>
            {auth?.user?.username}
          </Typography.Title>
          <Upload
            beforeUpload={handleUploadFile}
            showUploadList={false}
            maxCount={1}
          >
            <Button
              style={{
                // border: 0,
                // display: 'inline-block',
                // cursor: 'pointer',
                color: '#0095f6',
                padding: 0,
              }}
              // type="ghost"
              // icon={<PictureOutlined />}
              // size="large"
              type="link"
            >
              {tText.CPP}
            </Button>
          </Upload>
        </Col>
      </Row>
      <Form
        form={form}
        style={{
          marginTop: 32,
          marginBottom: 16,
        }}
        name="edit-profile-basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16, offset: 1 }}
        initialValues={{
          fullName: auth?.user?.fullName,
          username: auth?.user?.username,
          bio: auth?.user?.bio,
          email: auth?.user?.email,
          language,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          name="fullName"
          // label="Full name"
          label={tText.fullName}
          rules={[{ required: true, message: 'Please input your full name!' }]}
          extra="Help people discover your account by using the name you're known by: either your full name, nickname, or business name.
You can only change your name twice within 14 days."
        >
          <Input maxLength={30} />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please input your username!' }]}
          extra="In most cases, you'll be able to change your username back to old username for another 14 days."
        >
          <Input maxLength={30} disabled />
        </Form.Item>

        <Form.Item
          name="bio"
          label="Bio"
          rules={[{ required: true, message: 'Please input your bio!' }]}
        >
          <Input.TextArea showCount maxLength={200} />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
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
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="language"
          label={tText.language}
          rules={[{ required: true, message: 'Please select language!' }]}
        >
          <Select placeholder="Select your language" onChange={handleChange}>
            <Select.Option value={Language.EN}>English</Select.Option>
            <Select.Option value={Language.VI}>Tiếng Việt</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 7, span: 16 }} shouldUpdate>
          {() => (
            <Button
              style={{
                borderRadius: 3,
              }}
              htmlType="submit"
              disabled={
                !(
                  form.isFieldTouched('fullName') || form.isFieldTouched('bio')
                ) ||
                !!form.getFieldsError().filter(({ errors }) => errors.length)
                  .length
              }
            >
              {tText.submit}
            </Button>
          )}
        </Form.Item>
      </Form>
    </Fragment>
  )
}
