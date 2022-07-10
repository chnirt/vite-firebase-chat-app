import {
  Avatar,
  Button,
  Form,
  Input,
  message,
  Modal,
  Row,
  Typography,
  Upload,
} from 'antd'
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { UserOutlined } from '@ant-design/icons'

import { avatarPlaceholder } from '../../constants'
import { useAuth } from '../../context'
// import { capitalizeAvatarUsername } from '../../utils'

export const CreateBlogModal = forwardRef((props, ref) => {
  const auth = useAuth()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = useCallback(() => {
    setIsModalVisible(true)
  }, [])

  const handleOk = useCallback(() => {
    // setIsModalVisible(false)
    form
      .validateFields()
      .then((values) => {
        console.log(values)
        // onCreate(values)
      })
      .catch((info) => {
        // console.log('Validate Failed:', info)
      })
  }, [])

  const handleCancel = useCallback(() => {
    form.resetFields()
    setIsModalVisible(false)
  }, [])

  const normFile = useCallback((e) => {
    // console.log('Upload event:', e)
    if (Array.isArray(e)) {
      return e
    }
    return e && e.fileList
  }, [])

  useImperativeHandle(ref, () => ({
    show: showModal,
  }))

  return (
    <>
      <Modal
        title="Create new post"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            style={{
              color: '#0095f6',
            }}
            type="link"
            onClick={handleOk}
          >
            Share
          </Button>,
        ]}
        centered
      >
        <Row
          style={{
            // padding: '14px 4px 14px 16px',
            // borderWidth: 1,
            // borderStyle: 'solid',
            // marginTop: 18,
            marginBottom: 14,
          }}
          align="middle"
        >
          {/* <Avatar
            shape="circle"
            size={24}
            // icon={<UserOutlined color="#eeeeee" />}
            src={auth?.user?.avatar ?? avatarPlaceholder}
          >
            {capitalizeAvatarUsername(auth?.user?.username ?? '')}
          </Avatar> */}
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
          {auth?.user?.username && (
            <Typography.Title
              style={{ marginLeft: '14px', marginBottom: 0 }}
              level={5}
            >
              {auth?.user?.username}
            </Typography.Title>
          )}
        </Row>

        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{}}
        >
          <Form.Item
            name="caption"
            // label="Caption"
            rules={[
              {
                required: true,
                message: 'Please input the caption of post!',
              },
            ]}
          >
            <Input
              style={{ borderWidth: 0, padding: 0 }}
              placeholder="Write a caption..."
              maxLength={200}
            />
          </Form.Item>
          {/* <Upload
            beforeUpload={handleUploadFile}
            showUploadList={false}
            maxCount={1}
          >
            <Button
              style={{
                // border: 0,
                // display: 'inline-block',
                // cursor: 'pointer',
                padding: 0,
              }}
              // type="ghost"
              // icon={<PictureOutlined />}
              // size="large"
              type="link"
            >
              Change profile photo
            </Button>
          </Upload> */}
          <Form.Item
            name="files"
            // label="Files"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            // extra="longgggggggggggggggggggggggggggggggggg"
            rules={[
              {
                required: true,
                message: 'Please input the picture of post!',
              },
            ]}
          >
            <Upload
              name="picture"
              listType="picture"
              beforeUpload={(file) => {
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

                return false
              }}
              maxCount={1}
            >
              <Button
                type="primary"
                style={{
                  backgroundColor: '#0095f6',
                  borderColor: '#0095f6',
                  borderRadius: 4,
                }}
              >
                Select from computer
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
})
