import { getDocs, query, where } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { useUpdateProfile } from 'react-firebase-hooks/auth'

import { useAuth } from '../../context'
import { auth } from '../../firebase'
import {
  getBatch,
  getColGroupRef,
  getColRef,
  getDocRef,
  updateDocument,
} from '../../firebase/service'

const Profile = ({ }) => {
  const { user, fetchUser } = useAuth()
  const [updateProfile, updating, error] = useUpdateProfile(auth)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(user?.username ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? '')
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? '')
  const [followingList, setFollowingList] = useState([])
  const [followerList, setFollowerList] = useState([])
  const [likeList, setLikeList] = useState([])

  const handleUpdate = useCallback(async () => {
    if (displayName && photoURL) {
      await updateProfile({ displayName, photoURL })
    }
    if (!username || !avatar) return

    const userDocRef = getDocRef('users', user.uid)
    const userData = {
      username,
      avatar
    }
    await updateDocument(userDocRef, userData)

    // update following
    const batch = getBatch()
    const followingDocRef = getColGroupRef('following')
    const q = query(followingDocRef, where('uid', '==', user.uid))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((docSnapshot) => {
      const docRef = docSnapshot.ref
      batch.update(docRef, userData)
    })

    await batch.commit()

    await fetchUser(user)
    alert('Updated profile')
  }, [displayName, photoURL, username, avatar])

  useEffect(() => {
    const fetchFollowingData = async () => {
      setLoading(true)
      const followerDocRef = getColRef('users', user.uid, 'following')
      const q = query(followerDocRef, where('uid', '!=', user.uid))
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
      setLoading(false)
    }
    const fetchFollowerData = async () => {
      setLoading(true)
      const followerDocRef = getColRef('users', user.uid, 'follower')
      const querySnapshot = await getDocs(followerDocRef)
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      // console.log(data)
      setFollowerList(data)
      setLoading(false)
    }
    const fetchLikeData = async () => {
      setLoading(true)
      const likeDocRef = getColRef('users', user.uid, 'likes')
      const querySnapshot = await getDocs(likeDocRef)
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      // console.log(data)
      setLikeList(data)
      setLoading(false)
    }
    fetchFollowingData()
    fetchFollowerData()
    fetchLikeData()
  }, [])

  // https://youtu.be/kROrqp0Dx8o

  if (loading) {
    return <p>Loading...</p>
  }
  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    )
  }
  if (updating) {
    return <p>Updating...</p>
  }
  return (
    <div>
      Profile
      <br />
      {followerList.length} followers{` - `}
      {followingList.length} following{` - `}
      {likeList.length} likes
      <br />
      {/* <input
        type="text"
        placeholder="displayName"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="photoURL"
        value={photoURL}
        onChange={(e) => setPhotoURL(e.target.value)}
      />
      <br /> */}

      <input
        type="text"
        placeholder="avatar"
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
      />
      <br />
      <img
        style={{
          width: 100,
          height: 100,
        }}
        src={avatar}
        alt={'avatar'}
      />
      <br />
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <button onClick={handleUpdate}>Update profile</button>
      <br />
      <h4>{user?.displayName}</h4>
      {/* <h5>{user?.createdAt}</h5> */}
      {photoURL.length > 0 && (
        <img src={user?.photoURL} alt={'photoURL'} width={300} />
      )}
    </div>
  )
}

export default Profile
