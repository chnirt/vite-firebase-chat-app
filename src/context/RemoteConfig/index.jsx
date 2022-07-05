// https://sugarfabby.com/blog/create-feature-flags-for-your-react-app-with-firebase-remote-config
import { createContext, useContext, useMemo, useEffect, useState } from 'react'
import semverSatisfies from 'semver/functions/satisfies'

import {
  fetchAndActivateRemote,
  getRemoteAll,
  getRemoteValue,
} from '../../firebase/remoteConfig'
import { APP_VERSION } from '../../env'

const REMOTE_VALUE = {
  vite_app_title: 'string',
  vite_app_turn_urls: 'string',
  vite_app_turn_username: 'string',
  vite_app_turn_credentials: 'string',
  dark_mode: 'boolean',
  timeout: 'number',
}

const RemoteConfigContext = createContext()

export const RemoteConfigProvider = ({ children }) => {
  const [flags, setFlags] = useState({})

  const value = useMemo(() => flags, [flags])

  useEffect(() => {
    const setupRemoteConfig = async () => {
      try {
        const activated = await fetchAndActivateRemote()
        if (!activated) {
          // console.log('not activated')
        }
        const remoteFlags = getRemoteAll()
        // console.log(remoteFlags)
        const cloneFlags = {
          ...flags,
        }
        for (const [key, config] of Object.entries(remoteFlags)) {
          if (key.includes('_mode')) {
            const appVer = APP_VERSION
            cloneFlags[key] = semverSatisfies(appVer, config.asString())
          } else {
            cloneFlags[key] = getRemoteValue(key, REMOTE_VALUE[key])
          }
        }
        const newFlags = { ...remoteFlags, ...cloneFlags }
        // console.log(newFlags)
        setFlags(newFlags)
      } catch (error) {
        console.log(error)
      }
    }
    setupRemoteConfig()
  }, [])

  return (
    <RemoteConfigContext.Provider value={value}>
      {children}
    </RemoteConfigContext.Provider>
  )
}

export const useRemoteConfig = () => useContext(RemoteConfigContext)
