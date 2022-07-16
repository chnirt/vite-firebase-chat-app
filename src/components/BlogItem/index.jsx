import { Avatar, Button, List, Tag, Typography } from 'antd'
import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import {
  IoBookmark,
  IoBookmarkOutline,
  IoChatbubbleOutline,
  IoPaperPlaneOutline,
} from 'react-icons/io5'

import { avatarPlaceholder, colors } from '../../constants'
import { useAuth } from '../../context'
import {
  addDocument,
  deleteDocument,
  getDocRef,
  getDocument,
  updateDocument,
} from '../../firebase/service'
import { increment } from 'firebase/firestore'
import { css } from '@emotion/react'
import { splitWithUsername } from '../../utils'
import { Global } from '../../global'

export const BlogItem = ({ blog = {} }) => {
  const {
    id,
    isLiked,
    isSaved,
    file,
    avatar,
    username,
    createdAt,
    caption,
    likeTotal,
    commentTotal
  } = blog
  const auth = useAuth()

  const handleLike = useCallback(async (doc) => {
    const likeData = {
      postId: doc.id,
      uid: doc.uid,
    }
    const likeDocRef = getDocRef('users', auth?.user?.uid, 'likes', doc.id)
    await addDocument(likeDocRef, likeData)

    const blogDocRef = getDocRef('blogs', doc.id)
    const blogDocData = await getDocument(blogDocRef)
    const blogData = {
      likeTotal: increment(1),
    }
    if (blogDocData) {
      await updateDocument(blogDocRef, blogData)
    }
  }, [])

  const handleUnlike = useCallback(async (doc) => {
    const likeDocRef = getDocRef('users', auth?.user?.uid, 'likes', doc.id)
    const likeDocData = await getDocument(likeDocRef)
    if (likeDocData) {
      await deleteDocument('users', auth?.user?.uid, 'likes', doc.id)
    }

    const blogDocRef = getDocRef('blogs', doc.id)
    const blogDocData = await getDocument(blogDocRef)
    const blogData = {
      likeTotal: increment(-1),
    }
    if (blogDocData) {
      await updateDocument(blogDocRef, blogData)
    }
  }, [])

  const handleComment = useCallback((doc) => {
    Global.CommentModal.show(doc)
  }, [])

  const handleSave = useCallback(async (doc) => {
    const savedData = {
      postId: doc.id,
      uid: doc.uid,
    }
    const savedDocRef = getDocRef('users', auth?.user?.uid, 'saved', doc.id)
    await addDocument(savedDocRef, savedData)
  }, [])

  const handleUnsave = useCallback(async (doc) => {
    const savedDocRef = getDocRef('users', auth?.user?.uid, 'saved', doc.id)
    const savedDocData = await getDocument(savedDocRef)
    if (savedDocData) {
      await deleteDocument('users', auth?.user?.uid, 'saved', doc.id)
    }
  }, [])

  const captions = splitWithUsername(caption)

  return (
    <List.Item
      key={`item-${id}`}
      actions={[
        <div>
          <Button
            style={{
              border: 0,
              boxShadow: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            ghost
            shape="circle"
            icon={
              isLiked ? (
                <FiHeart size={18} color="#ff4d4f" fill="#ff4d4f" />
              ) : (
                <FiHeart size={18} color="#767676" />
              )
            }
            onClick={() => (isLiked ? handleUnlike(blog) : handleLike(blog))}
          />
          <Typography.Text>{likeTotal}</Typography.Text>
        </div>,
        <div>
          <Button
            style={{
              border: 0,
              boxShadow: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            ghost
            shape="circle"
            icon={<IoChatbubbleOutline size={18} color="#767676" />}
            onClick={() => handleComment(blog)}
          />
          <Typography.Text>{commentTotal}</Typography.Text>
        </div>,
        <Button
          style={{
            border: 0,
            boxShadow: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          ghost
          shape="circle"
          icon={<IoPaperPlaneOutline size={18} color="#767676" />}
        />,
        <Button
          style={{
            border: 0,
            boxShadow: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          ghost
          shape="circle"
          icon={
            isSaved ? (
              <IoBookmark size={18} color="#767676" />
            ) : (
              <IoBookmarkOutline size={18} color="#767676" />
            )
          }
          onClick={() => (isSaved ? handleUnsave(blog) : handleSave(blog))}
        />,
      ]}
      extra={<img width={272} alt="logo" src={file} />}
    >
      <List.Item.Meta
        avatar={<Avatar src={avatar ?? avatarPlaceholder} />}
        title={<Link to={`/user/${username}`}>@{username}</Link>}
        description={createdAt}
      />
      {captions.map((caption, ci) => {
        const isUsername = String(caption).startsWith('@')
        const usernameCaption = String(caption).substring(1)

        if (isUsername) {
          return (
            <Link key={`username-${ci}`} to={`/user/${usernameCaption}`}>
              <Tag
                css={css`
                  color: ${colors.firebase};
                  background: ${`${colors.firebase}10`};
                  border-color: ${`${colors.firebase}50`};
                `}
              >
                {caption}
              </Tag>
            </Link>
          )
        }
        return <div key={`username-${ci}`}>{caption}</div>
      })}
    </List.Item>
  )
}
