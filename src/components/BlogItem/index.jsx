import { Avatar, Button, List } from 'antd'
import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import { IoChatbubbleOutline, IoPaperPlaneOutline } from 'react-icons/io5'

import { avatarPlaceholder } from '../../constants'
import { useAuth } from '../../context'
import { addDocument, deleteDocument, getDocRef, getDocument } from '../../firebase/service'

export const BlogItem = ({ blog = {} }) => {
  const { id, isLiked, file, avatar, username, createdAt, caption } = blog
  const auth = useAuth()

  const handleLike = useCallback(async (doc) => {
    const likeData = {
      postId: doc.id,
      uid: doc.uid,
    }
    const likeDocRef = getDocRef('users', auth?.user?.uid, 'likes', doc.id)
    await addDocument(likeDocRef, likeData)
  }, [])

  const handleUnlike = useCallback(async (doc) => {
    const likeDocRef = getDocRef('users', auth?.user?.uid, 'likes', doc.id)
    const likeDocData = await getDocument(likeDocRef)

    if (likeDocData) {
      await deleteDocument('users', auth?.user?.uid, 'likes', doc.id)
    }
  }, [])

  return (
    <List.Item
      key={`item-${id}`}
      actions={[
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
          icon={<IoChatbubbleOutline size={18} color="#767676" />}
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
          icon={<IoPaperPlaneOutline size={18} color="#767676" />}
        />,
      ]}
      extra={<img width={272} alt="logo" src={file} />}
    >
      <List.Item.Meta
        avatar={<Avatar src={avatar ?? avatarPlaceholder} />}
        title={<Link to={`/user/${username}`}>@{username}</Link>}
        description={createdAt}
      />
      <div>{caption}</div>
    </List.Item>
  )
}
