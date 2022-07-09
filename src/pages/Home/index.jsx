
import { Fragment } from 'react';
import { Outlet } from 'react-router-dom'

const Home = () => {
  return (
    <Fragment>
      {/* Home */}
      <Outlet />
    </Fragment>
  )
}

export default Home
