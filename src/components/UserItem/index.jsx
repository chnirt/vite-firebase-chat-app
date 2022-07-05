import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getDocRef, getDocument } from '../../firebase/service'

export const UserItem = ({
  user,
  isOwner = false,
  isFollowing = false,
  handleFollow = () => { },
  handleUnFollow = () => { },
  handleMessage = () => { },
}) => {
  const [userDetail, setUserDetail] = useState(null)

  useEffect(() => {
    const fetchUserDetail = async () => {
      const userDocRef = getDocRef('users', user.id)
      const userDocData = await getDocument(userDocRef)
      setUserDetail(userDocData)
    }

    fetchUserDetail()
  }, [user])

  if (!userDetail) return null

  const id = user.id
  const email = user.email
  const createdAt = user.createdAt
  const username = userDetail.username

  return (
    <div
      key={`user-${id}`}
      style={{
        border: 'solid 1px black',
        margin: 8,
        // display: 'flex',
        // flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Link to={`/user/${username}`}>@{username}</Link>
      <p>{email}</p>
      <p>{moment(createdAt?.toDate()).fromNow()}</p>
      {!isOwner && (
        <div>
          {!isFollowing ? (
            <button onClick={() => handleFollow(user)}>follow</button>
          ) : (
            <button onClick={() => handleUnFollow(user)}>following</button>
          )}
          <button onClick={() => handleMessage(user)}>message</button>
        </div>
      )}
    </div>
  )
}
