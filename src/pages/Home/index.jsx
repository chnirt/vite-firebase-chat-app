import { Fragment, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { paths } from '../../constants'
import { Global } from '../../global'
import { SettingModal, CreateBlogModal, CommentModal, CreateNftModal } from '../../components'

const Home = () => {
  let navigate = useNavigate()

  useEffect(() => {
    navigate(paths.blog)
  }, [])

  return (
    <Fragment>
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
      <CommentModal
        ref={(ref) => {
          Global.CommentModal = ref
        }}
      />
      <CreateNftModal
        ref={(ref) => {
          Global.CreateNFTModal = ref
        }}
      />
    </Fragment>
  )
}

export default Home
