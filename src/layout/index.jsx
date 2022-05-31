import { Link } from 'react-router-dom'

export const Layout = ({ children }) => {
  return (
    <div className='App'>
      {import.meta.env.VITE_APP_TITLE}
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/change-password">Change Password</Link>
        </li>
      </ul>
      {children}
    </div>
  )
}
