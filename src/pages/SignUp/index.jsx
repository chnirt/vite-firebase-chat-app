import { useCallback, useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { Link } from 'react-router-dom'

import { auth } from '../../firebase'
// import { Loading } from '../../components'
import { addDocument } from '../../firebase/service'
import { eventNames } from '../../constants'
import { logEventAnalytics } from '../../firebase/analytics'

const SignUp = () => {
  const [email, setEmail] = useState('trinhchinchin@gmail.com')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState(null)

  const handleRegister = useCallback(async () => {
    try {
      if (email === '') return
      if (password === '') return

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (userCredential) {
        await addDocument('users', {
          uid: userCredential.user.uid,
          email,
        })
      }

      logEventAnalytics(eventNames.register, {
        email
      })
    } catch (err) {
      setError(err.message)
    }
  }, [email, password, createUserWithEmailAndPassword, addDocument, logEventAnalytics])

  return (
    <div className="App">
      SignUp
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
