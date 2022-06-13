import { fetchAndActivate, getAll, getValue } from "firebase/remote-config"

import { remoteConfig } from "."

export const refreshRemoteConfig = async () => await fetchAndActivate(remoteConfig)

export const getAllRemoteValue = () => getAll(remoteConfig)

export const getRemoteValue = (key = 'vite_app_title', type = 'string') =>
  type === 'string'
    ? getValue(remoteConfig, key).asString()
    : type === 'number'
      ? getValue(remoteConfig, key).asNumber()
      : type === 'boolean'
        ? getValue(remoteConfig, key).asBoolean()
        : getValue(remoteConfig, key).getSource()