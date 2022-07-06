import { signOut } from 'firebase/auth'
import { Link } from 'react-router-dom'
import { useAuth } from '../context'

import { auth } from '../firebase'
import { TITLE } from '../env'
import { useCallback } from 'react'

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
    path: '/whatsapp',
    name: 'WhatsApp',
  },
  {
    path: '/pexels',
    name: 'Pexels',
  },
  {
    path: '/search',
    name: 'Search',
  },
  {
    path: '/messenger',
    name: 'Messenger',
  },
  {
    path: '/audioPlayer',
    name: 'Audio Player',
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

  const handleLogout = useCallback(() => {
    signOut(auth)
    localStorage.clear()
  }, [])

  return (
    <div className="App">
      {TITLE}
      <p>Current User: {user.email}</p>
      <button onClick={handleLogout}>Log out</button>
      <ul
        style={{
          overflow: 'hidden',
        }}
      >
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
