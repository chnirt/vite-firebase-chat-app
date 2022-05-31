import { useState } from 'react'
import { useUpdatePassword } from 'react-firebase-hooks/auth'

import { auth } from '../../firebase'

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [updatePassword, updating, error] = useUpdatePassword(auth);

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    );
  }
  if (updating) {
    return <p>Updating...</p>;
  }
  return (
    <div>
      Change Password
      <br />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button
        onClick={async () => {
          await updatePassword(password);
          alert('Updated password');
        }}
      >
        Update password
      </button>
    </div>
  );
}

export default ChangePassword