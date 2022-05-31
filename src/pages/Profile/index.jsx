import { useState } from 'react'
import { useUpdateProfile } from 'react-firebase-hooks/auth'

import { useAuth } from '../../context'
import { auth } from '../../firebase'

const Profile = ({ }) => {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? '')
  const [updateProfile, updating, error] = useUpdateProfile(auth)
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
      <input
        type="displayName"
        placeholder="displayName"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <br />
      <input
        type="photoURL"
        placeholder="photoURL"
        value={photoURL}
        onChange={(e) => setPhotoURL(e.target.value)}
      />
      <br />
      <button
        onClick={async () => {
          await updateProfile({ displayName, photoURL })
          alert('Updated profile');
        }}
      >
        Update profile
      </button>
      <br />
      <h4>{user?.displayName}</h4>
      {photoURL.length > 0 && <img src={user?.photoURL} alt={'photoURL'} width={300} />}
    </div>
  )
}

export default Profile
