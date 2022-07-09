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
  Typography,
} from 'antd'
import { UserOutlined } from '@ant-design/icons'

import { useAuth, useLoading } from '../../context'
import {
  reauthenticateWithCredentialFirebase,
  updatePasswordFirebase,
} from '../../firebase/service'
import { logAnalyticsEvent } from '../../firebase/analytics'
import { eventNames } from '../../constants'

export const ChangePassword = () => {
  const auth = useAuth()
  const appLoading = useLoading()
  const [form] = Form.useForm()
  const [, forceUpdate] = useState({}) // To disable submit button at the beginning.

  useEffect(() => {
    forceUpdate({})
  }, [])

  const onFinish = useCallback(async (values) => {
    try {
      appLoading.show()
      // console.log('Success:', values)
      const { oldPassword, newPassword } = values

      const reauthenticated = await reauthenticateWithCredentialFirebase(
        oldPassword
      )
      if (reauthenticated) {
        await updatePasswordFirebase(newPassword)

        form.resetFields()

        // notification['success']({
        //   message: 'Successfully',
        //   description: 'Change password successfully',
        //   onClick: () => {
        //     // console.log('Notification Clicked!')
        //   },
        //   placement: 'bottomRight',
        // })
        message.success('Change password successfully.')

        logAnalyticsEvent(eventNames.changePassword)
      }
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

  return (
    <Fragment>
      <Row style={{ marginTop: 32 }}>
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
            src={
              auth?.user?.avatar ??
              'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'
            }
          />
        </Col>
        <Col span={16} offset={1}>
          <Typography.Title level={3}>{auth?.user?.username}</Typography.Title>
        </Col>
      </Row>
      <Form
        form={form}
        style={{
          marginTop: 32,
          marginBottom: 16,
        }}
        name="change-password-basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16, offset: 1 }}
        // initialValues={{}}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          name="oldPassword"
          label="Old Password"
          rules={[
            { required: true, message: 'Please input your old password!' },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          dependencies={['oldPassword']}
          rules={[
            { required: true, message: 'Please input your new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('oldPassword') !== value) {
                  return Promise.resolve()
                }

                return Promise.reject(
                  new Error(
                    'The new password must be deffer from old password!'
                  )
                )
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['newPassword']}
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }

                return Promise.reject(
                  new Error('The two passwords that you entered do not match!')
                )
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 7, span: 16 }} shouldUpdate>
          {() => (
            <Button
              style={{
                borderRadius: 3,
              }}
              htmlType="submit"
              disabled={
                !form.isFieldsTouched(true) ||
                !!form.getFieldsError().filter(({ errors }) => errors.length)
                  .length
              }
            >
              Change Password
            </Button>
          )}
        </Form.Item>
      </Form>
    </Fragment>
  )
}
