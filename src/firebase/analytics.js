import { logEvent } from "firebase/analytics";

import { analytics } from ".";

export const logEventAnalytics = (eventName = 'create_todo', eventParams = {}) =>
  logEvent(analytics, eventName, eventParams)