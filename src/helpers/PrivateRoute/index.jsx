import { Fragment } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../context'

export function PrivateRoute({ children }) {
  let { isAuth } = useAuth()

  return !isAuth ? (
    <Navigate
      to={{
        pathname: '/login',
      }}
    />
  ) : (
    <Fragment>{children}</Fragment>
  )
}
