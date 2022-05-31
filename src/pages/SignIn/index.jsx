import { useCallback, useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Link } from 'react-router-dom'

import { auth } from '../../firebase'

const SignIn = () => {
  const [email, setEmail] = useState('trinhchinchin@gmail.com')
  const [password, setPassword] = useState('Admin@123')

  const handleLogin = useCallback(async () => {
    if (email === '') return
    if (password === '') return

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
  }, [signInWithEmailAndPassword, email, password])

  return (
    <div className="App">
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
      <button onClick={handleLogin}>Sign In</button>
      <br />
      No account? <Link to="/register">Sign up</Link>
    </div>
  )
}

export default SignIn
