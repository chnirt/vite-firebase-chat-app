import { useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Loading } from '../../components'

import { useAuth, userChannel } from '../../context'
import { getDocRef, updateDocument } from '../../firebase/service'

const Spotify = () => {
  let location = useLocation()
  const auth = useAuth()

  const updateSpotifyToken = useCallback(
    async (spotifyToken) => {
      const userDocRef = getDocRef('users', auth?.user?.uid)
      const userData = {
        spotifyToken,
      }
      await updateDocument(userDocRef, userData)
      userChannel.postMessage({
        userId: auth?.user?.uid, // If the user opened your app in multi-tabs and signed-in with multi accounts, you need to put the userId here to identify which account has signed out exactly
        payload: {
          type: 'FETCH_USER',
        },
      })
      window.close()
    },
    [auth]
  )

  useEffect(() => {
    const hash = location.hash
    if (hash && auth?.user) {
      const spotifyToken = hash
        .substring(1)
        .split('&')
        .find((elem) => elem.startsWith('access_token'))
        .split('=')[1]
      updateSpotifyToken(spotifyToken)
    }
  }, [location, auth.user])

  return <Loading />
}

export default Spotify
