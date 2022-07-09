import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import debounce from 'lodash/debounce'
import isEmpty from 'lodash/isEmpty'

import { auth } from '../../firebase'
import { getDocRef, getDocument } from '../../firebase/service'

const defaultState = {
  isAuth: false,
  loaded: false,
  user: null,
  fetchUser: () => { },
}

const AuthContext = createContext(defaultState)

export const AuthProvider = ({ children }) => {
  const [loaded, setLoaded] = useState(false)
  const [userDocReference, setUserDocReference] = useState(null)
  const [user, setUser] = useState(null)

  const fetchUser = useCallback(
    async (fbUser) => {
      try {
        const userDocRef = getDocRef('users', fbUser.uid)
        const userDocData = await getDocument(userDocRef)

        if (userDocReference === null) {
          setUserDocReference(userDocRef)
        }
        setUser({ ...fbUser, ...userDocData })
      } catch (error) {
      } finally {
        setLoaded(true)
      }
    },
    [userDocReference]
  )

  const debounceFetchUser = debounce(fetchUser, 1000)

  useEffect(() => {
    onAuthStateChanged(
      auth,
      async (fbUser) => {
        if (fbUser) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          // const uid = user.uid
          if (user === null) {
            // console.log(fbUser)
            debounceFetchUser(fbUser)
          }
          // ...
        } else {
          // User is signed out
          // ...
          setUserDocReference(null)
          setUser(null)
        }
      },
      (error) => {
        // console.log(error)
      }
    )
  }, [user])

  const isAuth = !isEmpty(user) || false

  const value = useMemo(
    () => ({
      isAuth,
      loaded,
      user,
      fetchUser,
    }),
    [user, loaded, fetchUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
