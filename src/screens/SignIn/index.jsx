import { useState } from 'react'
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth'

import { auth } from '../../firebase'

export const SignIn = () => {
  const [email, setEmail] = useState('trinhchinchin@gmail.com')
  const [password, setPassword] = useState('Admin@123')
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth)

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    )
  }
  if (loading) {
    return <p>Loading...</p>
  }
  return (
    <div>
      SignIn
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
      <button onClick={() => signInWithEmailAndPassword(email, password)}>
        Sign In
      </button>
    </div>
  )
}
