// https://github.com/remix-run/react-router/issues/8427
import { notification } from 'antd'
import { Buffer } from 'buffer'

import { basename } from '../constants'
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '../env'

export const setUpBaseName = () => {
  if (!window.location.pathname.includes(basename)) {
    window.history.replaceState('', '', basename + window.location.pathname)
  }
}

export const setUpAppHeight = () => {
  const doc = document.documentElement
  doc.style.setProperty('--app-height', `${window.innerHeight}px`)
  // console.log(window.innerHeight)
}
window.addEventListener('resize', setUpAppHeight)

export const handleError = (error) => {
  notification['error']({
    message: error.code,
    description: error.message,
    onClick: () => {
      // console.log('Notification Clicked!')
    },
    placement: 'bottomRight',
  })
}

export const capitalizeFirstLetter = (value) => {
  return value.charAt(0).toUpperCase()
}

export const capitalizeAvatarUsername = (value) => {
  return value.split(' ').map((char) => capitalizeFirstLetter(char))
}

// https://dev.to/haydenbleasel/creating-a-no-auth-spotify-playlist-preview-with-nextjs-3dk1
export const getSpotifyAccessToken = async () => {
  const authorization = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')
  const grant = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const { access_token } = await grant.json()

  return access_token
}
