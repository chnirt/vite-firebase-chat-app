// https://github.com/remix-run/react-router/issues/8427
import { notification } from 'antd'
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

export const handleError = (error) => {
  notification['error']({
    message: error.code,
    description: error.message,
    onClick: () => {
      console.log('Notification Clicked!')
    },
    placement: 'bottomRight',
  })
}

export const capitalizeFirstLetter = (value) => {
  return value.charAt(0).toUpperCase()
}

export const capitalizeAvatarUsername = (value) => {
  return value.split(' ').map((char) => capitalizeFirstLetter(char))
}
