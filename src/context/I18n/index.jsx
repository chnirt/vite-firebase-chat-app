import {
  useContext,
  createContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'

import translationEN from '../../assets/i18n/en.json'
import translationVI from '../../assets/i18n/vi.json'

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  en: {
    translation: translationEN,
  },
  vi: {
    translation: translationVI,
  },
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en', // use en if detected lng is not available

    // keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

const defaultState = {
  language: 'en',
  changeLanguage: () => { },
}

const I18nContext = createContext(defaultState)

export const I18nProvider = ({ children }) => {
  const { i18n } = useTranslation()

  useEffect(() => {
    i18n.changeLanguage(localStorage.getItem('language') || 'en')
  }, [i18n])

  const changeLanguage = useCallback(
    (lng) => {
      i18n.changeLanguage(lng)
      localStorage.setItem('language', lng)
    },
    [i18n]
  )

  const value = useMemo(
    () => ({
      language: i18n.language,
      changeLanguage,
    }),
    [changeLanguage, i18n.language]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
