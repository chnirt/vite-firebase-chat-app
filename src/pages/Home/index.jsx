
import { Fragment, useRef } from 'react';
import { Outlet } from 'react-router-dom'

import { CreateBlogModal } from '../../components/CreateBlogModal';
import { Global } from '../../global';

const Home = () => {
  const modalRef = useRef()

  return (
    <Fragment>
      {/* Home */}
      <Outlet />
      <CreateBlogModal ref={ref => { Global.CreateBlogModal = ref }} />
    </Fragment>
  )
}

export default Home
