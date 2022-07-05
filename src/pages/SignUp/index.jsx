import { useCallback, useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { Link } from 'react-router-dom'
import { getDocs, query, where } from 'firebase/firestore'

import { auth } from '../../firebase'
// import { Loading } from '../../components'
import { addDocument, getColRef, getDocRef } from '../../firebase/service'
import { eventNames } from '../../constants'
import { logAnalyticsEvent } from '../../firebase/analytics'
import { generateKeywords } from '../../firebase/utils'

const SignUp = () => {
  const [avatar, setAvatar] = useState(
    'https://server-avatar.nimostatic.tv/201902231550916212700_1659511695712_avatar.png'
  )
  const [username, setUsername] = useState('trinhchinchin')
  const [email, setEmail] = useState('trinhchinchin@gmail.com')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState(null)

  const handleRegister = useCallback(async () => {
    try {
      if (username === '') return
      if (email === '') return
      if (password === '') return

      const q = query(getColRef('users'), where('username', '==', username))
      const querySnapshot = await getDocs(q)
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      const foundUser = data[0]
      if (foundUser) {
        throw Error('Username already exists!')
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (userCredential) {
        const uid = userCredential.user.uid
        const userDocRef = getDocRef('users', uid)
        const userData = {
          uid,
          email,
          avatar,
          username,
          keywords: generateKeywords(email),
        }
        await addDocument(userDocRef, userData)

        const followingData = {
          type: 'owner',
          uid,
          avatar,
          username,
        }
        const followerDocRef = getDocRef('users', uid, 'following', uid)
        await addDocument(followerDocRef, followingData)
      }

      logAnalyticsEvent(eventNames.register, {
        email,
      })
    } catch (err) {
      setError(err.message)
    }
  }, [
    email,
    password,
    avatar,
    username,
    createUserWithEmailAndPassword,
    addDocument,
    logAnalyticsEvent,
  ])

  return (
    <div className="App">
      SignUp
      <br />
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
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="password"
        security="true"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      {error && <p>{error}</p>}
      <br />
      <button onClick={handleRegister}>Sign Up</button>
      <br />
      Have an account? <Link to="/">Sign in</Link>
    </div>
  )
}

export default SignUp
