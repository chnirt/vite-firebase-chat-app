import { env } from "../constants";
import { getRemoteValue } from "../firebase/remoteConfig";

export const APP_TITLE = getRemoteValue('vite_app_title', 'string') || env?.VITE_APP_TITLE