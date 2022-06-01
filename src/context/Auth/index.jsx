import { createContext, useContext, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "../../firebase";
import { Loading } from '../../components'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, loading, error] = useAuthState(auth)

  const value = useMemo(() => ({
    isAuth: !!user ?? false,
    user,
  }), [user])

  if (loading) {
    return (
      <Loading />
    );
  }
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)