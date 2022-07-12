import { Fragment, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { paths } from '../../constants'
import { Global } from '../../global'
import { SettingModal, CreateBlogModal } from '../../components'

const Home = () => {
  let navigate = useNavigate()

  useEffect(() => {
    navigate(paths.profile)
  }, [])

  return (
    <Fragment>
      {/* Home */}
      <Outlet />
      <CreateBlogModal
        ref={(ref) => {
          Global.CreateBlogModal = ref
        }}
      />
      <SettingModal
        ref={(ref) => {
          Global.SettingModal = ref
        }}
      />
    </Fragment>
  )
}

export default Home
