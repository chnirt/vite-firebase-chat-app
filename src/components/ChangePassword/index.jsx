import { Fragment } from 'react'
import { Avatar, Button, Col, Form, Input, Row, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'

import { useAuth } from '../../context'

export const ChangePassword = () => {
  const auth = useAuth()

  const onFinish = (values) => {
    console.log('Success:', values)
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

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
          <Typography.Title level={3}>trinhchinchin</Typography.Title>
        </Col>
      </Row>
      <Form
        style={{
          marginTop: 32,
          marginBottom: 16,
        }}
        name="basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16, offset: 1 }}
        // initialValues={{ remember: true }}
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
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['newPassword']}
          hasFeedback
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

        <Form.Item wrapperCol={{ offset: 7, span: 16 }}>
          <Button
            style={{
              backgroundColor: '#0095F6',
              borderColor: '#0095F6',
              // display: 'inline-flex',
              // alignItems: 'center',
              // justifyContent: 'center',
              // marginLeft: 20,
              borderRadius: 3,
              // paddingLeft: 24,
              // paddingRight: 24,
            }}
            type="primary"
            htmlType="submit"
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Fragment>
  )
}
