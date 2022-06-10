import { env } from "../constants";
import { parametersFb } from "../firebase";

export const APP_TITLE = parametersFb.vite_app_title.asString() || env.VITE_APP_TITLE