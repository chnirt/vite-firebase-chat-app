import {
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  Row,
  Typography,
  Upload,
} from 'antd'
import {
  forwardRef,
  Fragment,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react'
import { UserOutlined } from '@ant-design/icons'
import { arrayUnion } from 'firebase/firestore'

import { avatarPlaceholder, eventNames } from '../../constants'
import { useAuth, useLoading } from '../../context'
import { uploadStorageBytesResumable } from '../../firebase/storage'
import { addDocument, getColRef } from '../../firebase/service'
import { logAnalyticsEvent } from '../../firebase/analytics'
// import { capitalizeAvatarUsername } from '../../utils'

export const CreateBlogModal = forwardRef((props, ref) => {
  const auth = useAuth()
  const appLoading = useLoading()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = useCallback(() => {
    setIsModalVisible(true)
  }, [])

  const handleOk = useCallback(async () => {
    try {
      appLoading.show()
      const values = await form.validateFields()
      const { caption, files } = values
      const file = files[0].originFileObj
      uploadStorageBytesResumable(
        file,
        null,
        null,
        async ({ downloadURL: file, url }) => {
          // setDownloadURL(downloadURL)

          const blogData = {
            caption: String(caption).trim(),
            files: arrayUnion({
              file,
              url,
            }),
            uid: auth?.user?.uid,
          }

          const blogDocRef = getColRef('blogs')
          await addDocument(blogDocRef, blogData)

          setTimeout(() => {
            appLoading.hide()
          }, 1000)

          handleCancel()

          logAnalyticsEvent(eventNames.createBlog, {
            caption,
          })
        }
      )
    } catch (error) {
      console.log('Validate Failed:', error)
    }
  }, [])

  const handleCancel = useCallback(() => {
    setIsModalVisible(false)
  }, [])

  const normFile = useCallback((e) => {
    // console.log('Upload event:', e)
    if (Array.isArray(e)) {
      return e
    }
    return e && e.fileList
  }, [])

  const handleAfterClose = useCallback(() => {
    form.resetFields()
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      show: showModal,
    }),
    []
  )

  return (
    <Fragment>
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
        afterClose={handleAfterClose}
      >
        <Row
          style={{
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
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('files') === value) {
                    const file = getFieldValue('files')?.[0]

                    if (file) {
                      const isJpgOrPng =
                        file.type === 'image/jpeg' || file.type === 'image/png'
                      if (!isJpgOrPng) {
                        return Promise.reject(
                          new Error('You can only upload JPG/PNG file!')
                        )
                      }
                      const isLt2M = file.size / 1024 / 1024 < 2
                      if (!isLt2M) {
                        return Promise.reject(
                          new Error('Image must smaller than 2MB!')
                        )
                      }
                    }

                    return Promise.resolve()
                  }

                  return Promise.reject()
                },
              }),
            ]}
          >
            <Upload
              name="picture"
              listType="picture"
              beforeUpload={(file) => {
                console.log('beforeUpload', file)
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
    </Fragment>
  )
})
