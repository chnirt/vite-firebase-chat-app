
import { signOut } from 'firebase/auth'
import { Outlet } from 'react-router-dom'

import { useAuth } from '../../context'
import { auth } from '../../firebase'

const Home = () => {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div>
      Home
      <br />
      <p>Current User: {user.email}</p>
      <button onClick={() => signOut(auth)}>Log out</button>

      <Outlet />
    </div>
  )
}

export default Home
