// https://github.com/remix-run/react-router/issues/8427
import { basename } from '../constants'

export const setUpBaseName = () => {
  if (!window.location.pathname.includes(basename)) {
    window.history.replaceState('', '', basename + window.location.pathname)
  }
}
