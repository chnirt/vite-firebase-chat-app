import { Button, Input, message, Modal, Row } from 'antd'
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react'
import debounce from 'lodash/debounce'
import { increment } from 'firebase/firestore'

import { useAuth } from '../../context'
import { MyAvatar } from '../MyAvatar'
import {
  addDocument,
  getColRef,
  getDocRef,
  getDocument,
  updateDocument,
} from '../../firebase/service'
import { CommentList } from '../CommentList'

export const CommentModal = forwardRef((props, ref) => {
  const auth = useAuth()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentBlog, setCurrentBlog] = useState(null)
  const [comment, setComment] = useState('')
  const [repliedComment, setRepliedComment] = useState(null)

  const showModal = useCallback((blogInput) => {
    setCurrentBlog(blogInput)
    setIsModalVisible(true)
  }, [])

  const handleCancel = useCallback(() => {
    setIsModalVisible(false)
  }, [])

  const handleOk = useCallback(async () => {
    try {
      const newComment = String(comment).trim()
      const commentColRef = getColRef('blogs', currentBlog?.id, 'comments')
      const commentData = {
        text: newComment,
        sender: auth?.user?.uid,
        parentId: repliedComment ? repliedComment?.id : '0',
      }
      await addDocument(commentColRef, commentData)

      const blogDocRef = getDocRef('blogs', currentBlog?.id)
      const blogDocData = await getDocument(blogDocRef)
      const blogData = {
        commentTotal: increment(1),
      }
      if (blogDocData) {
        await updateDocument(blogDocRef, blogData)
      }
    } catch (error) {
      message.error(error.message)
    } finally {
      handleCancel()
    }
  }, [currentBlog, comment, repliedComment])

  const handleAfterClose = useCallback(() => {
    setComment('')
    setRepliedComment(null)
  }, [])

  const handleReply = useCallback(async (comment) => {
    setRepliedComment(comment)
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      show: showModal,
    }),
    []
  )

  const avatar = auth?.user?.avatar

  return (
    <Modal
      title="Comments"
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={
        <Row align="middle">
          <MyAvatar src={avatar} />
          <Input
            style={{
              borderWidth: 0,
              flex: 1,
            }}
            placeholder="Message..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={200}
            onPressEnter={debounce(handleOk, 200)}
          />
          <Button
            key="submit"
            style={{
              color: '#0095f6',
            }}
            type="link"
            onClick={handleOk}
          >
            Post
          </Button>
        </Row>
      }
      centered
      afterClose={handleAfterClose}
      bodyStyle={{
        overflow: 'hidden scroll',
        height: 400,
      }}
    >
      <CommentList currentBlog={currentBlog} handleReply={handleReply} />
    </Modal>
  )
})
