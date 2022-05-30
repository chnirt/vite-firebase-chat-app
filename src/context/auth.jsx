import { createContext, useCallback, useContext, useMemo } from 'react'
import { signOut } from 'firebase/auth'
import {
  useAuthState,
  useCreateUserWithEmailAndPassword,
  useSignInWithEmailAndPassword,
} from 'react-firebase-hooks/auth'

import { auth } from '../firebase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, loading, error] = useAuthState(auth)
  const [
    createUserWithEmailAndPassword,
    // user,
    // loading,
    // error,
  ] = useCreateUserWithEmailAndPassword(auth)
  const [
    signInWithEmailAndPassword,
    // user,
    // loading,
    // error,
  ] = useSignInWithEmailAndPassword(auth)
  const register = useCallback((email, password) => {
    createUserWithEmailAndPassword(email, password)
  }, [])
  const login = useCallback((email, password) => {
    signInWithEmailAndPassword(email, password)
  }, [])
  const logout = useCallback(() => {
    signOut(auth)
  }, [])

  const value = useMemo(
    () => ({
      user,
      register,
      login,
      logout,
    }),
    [user, register, login, logout]
  )

  if (loading) {
    return (
      <div>
        <p>Initializing User...</p>
      </div>
    )
  }
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
