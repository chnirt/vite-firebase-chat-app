import { fetchAndActivate, getAll, getValue } from "firebase/remote-config"

import { remoteConfig } from "."

export const refreshRemote = async () => await fetchAndActivate(remoteConfig)

export const getRemoteAll = () => getAll(remoteConfig)

export const getRemoteValue = (key = 'vite_app_title', type = 'string') =>
  type === 'string'
    ? getValue(remoteConfig, key).asString()
    : type === 'number'
      ? getValue(remoteConfig, key).asNumber()
      : type === 'boolean'
        ? getValue(remoteConfig, key).asBoolean()
        : getValue(remoteConfig, key).getSource()