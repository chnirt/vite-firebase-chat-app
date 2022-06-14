import { env } from "../constants";
import { getRemoteValue } from "../firebase/remoteConfig";

export const TITLE = getRemoteValue('vite_app_title', 'string') || env?.VITE_APP_TITLE

export const TURN_URLS = getRemoteValue('vite_app_turn_urls', 'string') || env?.VITE_APP_TURN_URLS
export const TURN_USERNAME = getRemoteValue('vite_app_turn_username', 'string') || env?.VITE_APP_TURN_USERNAME
export const TURN_CREDENTIALS = getRemoteValue('vite_app_turn_credentials', 'string') || env?.VITE_APP_TURN_CREDENTIALS