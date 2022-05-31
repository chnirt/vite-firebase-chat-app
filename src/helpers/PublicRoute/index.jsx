import { Fragment } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../context'

export function PublicRoute({ children }) {
  let { isAuth } = useAuth()

  return isAuth ? (
    <Navigate
      to={{
        pathname: '/',
      }}
    />
  ) : (
    <Fragment>{children}</Fragment>
  )
}
