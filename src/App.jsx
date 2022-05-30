import { useAuthState } from 'react-firebase-hooks/auth'
import './App.css'
import { SignIn, SignUp, Home } from './screens'
import { auth } from './firebase'

function App() {
  const [user, loading, error] = useAuthState(auth)

  if (loading) {
    return (
      <div>
        <p>Initializing User...</p>
      </div>
    )
  }
  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    )
  }
  if (user) {
    return (
      <div>
        <Home />
      </div>
    )
  }

  return (
    <div className="App">
      {import.meta.env.VITE_APP_TITLE}
      <SignUp />
      <SignIn />
    </div>
  )
}

export default App
