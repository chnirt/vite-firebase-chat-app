import { Fragment, useCallback, useEffect } from 'react'
import { Button, Image, Row, Typography } from 'antd'
import { deleteField } from 'firebase/firestore'

import SpotifyLogo from '../../assets/logo/spotify_logo.png'
import {
  SPOTIFY_AUTH_ENDPOINT,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_RESPONSE_TYPE,
} from '../../env'
import { useAuth } from '../../context'
import { getDocRef, updateDocument } from '../../firebase/service'

export const Applications = () => {
  const auth = useAuth()

  const handleUnconnectSpotify = useCallback(async () => {
    const userDocRef = getDocRef('users', auth?.user?.uid)
    const userData = {
      spotifyToken: deleteField(),
    }
    await updateDocument(userDocRef, userData)

    auth?.fetchUser(auth?.user)
  }, [])

  const spotifyToken = auth?.user?.spotifyToken

  return (
    <Fragment>
      <Row
        style={{ margin: '32px 32px 0 32px' }}
        align="middle"
        justify="space-between"
      >
        <Row align="middle" justify="space-between">
          <div style={{ marginRight: 8 }}>
            <Image src={SpotifyLogo} width={30} preview={false} />
          </div>
          <Typography.Text>Spotify</Typography.Text>
        </Row>
        {spotifyToken ? (
          <Button
            style={{
              padding: 0,
            }}
            type="link"
            danger
            onClick={handleUnconnectSpotify}
          >
            UNCONNECT
          </Button>
        ) : (
          <Button
            style={{
              padding: 0,
            }}
            type="link"
            danger
            target="_blank"
            href={`${SPOTIFY_AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${SPOTIFY_REDIRECT_URI}&response_type=${SPOTIFY_RESPONSE_TYPE}`}
          >
            CONNECT
          </Button>
        )}
      </Row>
    </Fragment>
  )
}
