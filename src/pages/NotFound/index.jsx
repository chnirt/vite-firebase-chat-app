import { Button, Typography } from 'antd'
import { t } from 'i18next'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { paths } from '../../constants'

const NotFound = () => {
  let navigate = useNavigate()

  const navigateHome = useCallback(() => {
    navigate(paths)
    // navigate(-1)
  }, [navigate])

  return (
    <div
      style={{
        /* Full height */
        height: '100vh',

        /* Center and scale the image nicely */
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundImage:
          'url("https://images.unsplash.com/photo-1545972154-9bb223aac798?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3050&q=80&exp=8&con=-15&sat=-75")',

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography.Title
          style={{
            color: '#ffffff',
          }}
          level={3}
        >
          404
        </Typography.Title>
        <Typography.Paragraph
          style={{
            color: '#ffffff',
          }}
          type="secondary"
        >
          {t('src.screens.notfound.STPYVDNE')}
        </Typography.Paragraph>
        <Button onClick={navigateHome} type="primary">
          {t('src.screens.notfound.BH')}
        </Button>
      </div>
    </div>
  )
}

export default NotFound
