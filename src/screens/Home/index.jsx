
import { signOut } from 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../firebase'
import { UpdateProfile } from '../UpdateProfile'

export const Home = () => {
  const [user, loading, error] = useAuthState(auth)

  if (loading) {
    return (
      <div>
        <p>Initialising User...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    );
  }
  return (
    <div>
      Home
      <br />
      <p>Current User: {user.email}</p>
      <button onClick={() => signOut(auth)}>Log out</button>

      <UpdateProfile user={user} />
    </div>
  )
}
