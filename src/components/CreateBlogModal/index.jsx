import {
  Avatar,
  Button,
  Form,
  Mentions,
  Modal,
  Row,
  Typography,
  Upload,
} from 'antd'
import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { UserOutlined } from '@ant-design/icons'
import { arrayUnion, getDocs, query, where } from 'firebase/firestore'

import { avatarPlaceholder, eventNames } from '../../constants'
import { useAuth } from '../../context'
import { uploadStorageBytesResumable } from '../../firebase/storage'
import {
  addDocument,
  getBatch,
  getColRef,
  getDocRef,
} from '../../firebase/service'
import { logAnalyticsEvent } from '../../firebase/analytics'
import { t } from 'i18next'
// import { capitalizeAvatarUsername } from '../../utils'

export const CreateBlogModal = forwardRef((props, ref) => {
  const auth = useAuth()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [followingList, setFollowingList] = useState([])

  const usernames = followingList.map((item) => item.username)

  const showModal = useCallback(() => {
    setIsModalVisible(true)
  }, [])

  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields()
      const { caption, files } = values
      // console.log(values)

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
          const newBlogDocRef = await addDocument(blogDocRef, blogData)
          const doc = newBlogDocRef

          const batch = getBatch()
          followingList.forEach((item) => {
            const isTagged = caption.includes(`@${item.username} `)
            if (isTagged) {
              const taggedData = {
                postId: doc.id,
                uid: item.uid,
              }
              const taggedDocRef = getDocRef(
                'users',
                item.uid,
                'tagged',
                doc.id
              )
              // await addDocument(taggedDocRef, taggedData)
              batch.set(taggedDocRef, taggedData)
            }
          })

          await batch.commit()

          handleCancel()

          logAnalyticsEvent(eventNames.createBlog, {
            caption: String(caption).trim(),
          })
        }
      )
    } catch (error) {
      console.log('Validate Failed:', error)
    }
  }, [followingList])

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

  useEffect(() => {
    const fetchFollowingData = async () => {
      const followingDocRef = getColRef('users', auth?.user?.uid, 'following')
      const q = query(followingDocRef, where('uid', '!=', auth?.user.uid))
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
    if (isModalVisible) {
      fetchFollowingData()
    }
  }, [isModalVisible])

  const tText = {
    cnp: t('src.components.CreateBlogModal.cnp'),
    share: t('src.components.CreateBlogModal.share'),
    wac: t('src.components.CreateBlogModal.wac'),
    sfc: t('src.components.CreateBlogModal.sfc'),
  }

  return (
    <Fragment>
      <Modal
        title={tText.cnp}
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
            {tText.share}
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
            <Mentions rows={1} placeholder={tText.wac} maxLength={200}>
              {usernames.map((username, ui) => (
                <Mentions.Option
                  key={`username-${username}-${ui}`}
                  value={username}
                >
                  {username}
                </Mentions.Option>
              ))}
            </Mentions>
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
                // console.log('beforeUpload', file)
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
                {tText.sfc}
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Fragment>
  )
})
