// https://stackoverflow.com/questions/58813834/how-multi-tab-logout-can-be-managed-in-reactjs
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
import { Loading } from '../../components'

const defaultState = {
  isAuth: false,
  loaded: false,
  user: null,
  fetchUser: () => { },
}

export const userChannel = new BroadcastChannel('user')

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
        // setUser({ ...fbUser, ...userDocData })
        setUser(userDocData)
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

  useEffect(() => {
    userChannel.onmessage = (e) => {
      const type = e.data.payload.type
      if (type === 'FETCH_USER') {
        // As I talked before about multi-accounts, we need to check the current user id with the sent userId by the userChannel and if they were the same, we have to dispatch the userSignOut action.
        fetchUser(user)
      }
      if (type === 'SIGN_OUT') {
      }
    }
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

  if (!loaded) return <Loading />

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
