import { Button, Modal } from 'antd'
import {
  forwardRef,
  Fragment,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { useLoading } from '../../context'
import { signOutFirebase } from '../../firebase/service'
import { paths } from '../../constants'

export const SettingModal = forwardRef((props, ref) => {
  const appLoading = useLoading()
  let navigate = useNavigate()

  const [visible, setVisible] = useState(false)

  const showModal = useCallback(() => {
    setVisible(true)
  }, [])

  const handleOk = useCallback(() => { }, [])

  const handleCancel = useCallback(() => {
    setVisible(false)
  }, [])

  const handleSignOut = useCallback(async () => {
    try {
      appLoading.show()
      removeToken()
      await signOutFirebase()
    } catch (error) {
    } finally {
      setTimeout(() => {
        appLoading.hide()
        handleCancel()
      }, 1000)
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      show: showModal,
    }),
    []
  )

  const menuList = useMemo(
    () => [
      {
        title: 'Change password',
        onClick: () => {
          handleCancel()
          navigate(`../${paths.profile}`)
        },
      },
      {
        title: 'Log out',
        onClick: handleSignOut,
      },
      {
        title: 'Cancel',
        onClick: handleCancel,
      },
    ],
    []
  )

  return (
    <Fragment>
      <Modal
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        closable={false}
        centered
        bodyStyle={{
          padding: 0,
        }}
      >
        {menuList.length > 0 &&
          menuList.map((menu, mi) => (
            <Button
              key={`menu-${mi}`}
              style={{
                color: '#262626',
                height: 48,
              }}
              type="link"
              block
              onClick={menu.onClick}
            >
              {menu.title}
            </Button>
          ))}
      </Modal>
    </Fragment>
  )
})
