// https://github.com/remix-run/react-router/issues/8427
import { basename } from '../constants'

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
