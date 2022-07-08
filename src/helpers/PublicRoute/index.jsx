import { Fragment } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../context'
import { paths } from '../../constants'

export function PublicRoute({ children }) {
  let auth = useAuth()

  return auth.isAuth ? (
    <Navigate
      to={{
        pathname: paths.home,
      }}
    />
  ) : (
    <Fragment>{children}</Fragment>
  )
}
