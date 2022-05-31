import { signOut } from 'firebase/auth'
import { Link } from 'react-router-dom'
import { useAuth } from '../context'

import { auth } from '../firebase'

const LinkRoutes = [
  {
    path: '/',
    name: 'Home',
  },
  {
    path: '/blog',
    name: 'Blog',
  },
  {
    path: '/messenger',
    name: 'Messenger',
  },
  {
    path: '/profile',
    name: 'Profile',
  },
  {
    path: '/change-password',
    name: 'Change Password',
  },
]

export const Layout = ({ children }) => {
  const { user } = useAuth()

  return (
    <div className="App">
      {import.meta.env.VITE_APP_TITLE}
      <p>Current User: {user.email}</p>
      <button onClick={() => signOut(auth)}>Log out</button>
      <ul style={{
        overflow: "hidden"
      }}>
        {LinkRoutes.length &&
          LinkRoutes.map((route, ri) => (
            <li
              style={{ float: 'left', listStyleType: 'none', padding: 8 }}
              key={`route-${ri}`}
            >
              <Link to={route.path}>{route.name}</Link>
            </li>
          ))}
      </ul>
      {children}
    </div>
  )
}
