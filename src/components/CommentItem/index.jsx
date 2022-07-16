import { useCallback, useEffect, useState } from 'react'
import { Avatar, Comment } from 'antd'
import { Link } from 'react-router-dom'

import { avatarPlaceholder } from '../../constants'
import { getDocRef, getDocument } from '../../firebase/service'

export const CommentItem = ({ comment, handleReply = () => { }, children }) => {
  const [currentUser, setCurrentUser] = useState(null)

  const fetchUserDetail = useCallback(async () => {
    if (!comment) return

    const userDocRef = getDocRef('users', comment.sender)
    const userDocData = await getDocument(userDocRef)
    setCurrentUser(userDocData)
  }, [comment])

  useEffect(() => {
    fetchUserDetail()
  }, [fetchUserDetail])

  const avatar = currentUser?.avatar
  const username = currentUser?.username
  const text = comment?.text

  return (
    <Comment
      actions={[
        <span
          key="comment-nested-reply-to"
          onClick={() => handleReply(comment)}
        >
          Reply to
        </span>,
      ]}
      author={<Link to={`/user/${username}`}>@{username}</Link>}
      avatar={<Avatar src={avatar ?? avatarPlaceholder} alt={username} />}
      content={<p>{text}</p>}
    >
      {children}
    </Comment>
  )
}
