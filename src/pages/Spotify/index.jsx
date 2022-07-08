import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useLocalStorage } from '../../hooks'
import { useAuth } from '../../context'
import { paths } from '../../constants'

const Spotify = () => {
  let location = useLocation()
  let navigate = useNavigate()
  const [, setToken] = useLocalStorage('token', '')
  const { user, loaded } = useAuth()

  useEffect(() => {
    const hash = location.hash
    if (hash) {
      const newToken = hash
        .substring(1)
        .split('&')
        .find((elem) => elem.startsWith('access_token'))
        .split('=')[1]
      setToken(newToken)
    }
  }, [location])

  useEffect(() => {
    if (loaded) {
      if (user) {
        navigate(`../${paths.audioPlayer}`)
      } else {
        navigate(paths.home)
      }
    }
  }, [loaded, user])

  return null
}

export default Spotify
