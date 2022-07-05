import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import _ from 'lodash'

import { auth } from '../../firebase'
import { getDocRef, getDocument } from '../../firebase/service'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
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
      }
    },
    [userDocReference]
  )

  const debounceFetchUser = _.debounce(fetchUser, 1000)

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
      (error) => { },
      () => { }
    )
  }, [user])

  const value = useMemo(
    () => ({
      isAuth: !!user ?? false,
      user,
      fetchUser,
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
