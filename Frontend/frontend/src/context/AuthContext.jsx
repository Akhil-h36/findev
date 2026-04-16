// src/context/AuthContext.jsx
// Provides: isLoggedIn, saveAuth(tokens), logout()
// Used by: LoginPage, Discover (logout), ProtectedRoute, GuestRoute

// import { createContext, useContext, useState, useCallback } from 'react'

// const AuthContext = createContext(null)

// export function AuthProvider({ children }) {
//   // Initialise from localStorage so a page refresh keeps the session alive
//   const [accessToken, setAccessToken] = useState(
//     () => localStorage.getItem('access_token') || null
//   )

//   const isLoggedIn = Boolean(accessToken)

//   /** Call after a successful login / OTP verify */
//   const saveAuth = useCallback(({ access, refresh }) => {
//     localStorage.setItem('access_token',  access)
//     localStorage.setItem('refresh_token', refresh)
//     setAccessToken(access)
//   }, [])

//   /** Wipe tokens and mark as logged-out */
//   const logout = useCallback(() => {
//     localStorage.removeItem('access_token')
//     localStorage.removeItem('refresh_token')
//     setAccessToken(null)
//   }, [])

//   return (
//     <AuthContext.Provider value={{ isLoggedIn, accessToken, saveAuth, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext)
//   if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
//   return ctx
// }



import { createContext, useContext, useState, useCallback } from 'react'
 
const AuthContext = createContext(null)
 
export function AuthProvider({ children }) {
  // Initialise from localStorage so a page refresh keeps the session alive
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem('access_token') || null
  )
 
  const isLoggedIn = Boolean(accessToken)
 
  /** Call after a successful login / OTP verify */
  const saveAuth = useCallback(({ access, refresh }) => {
    localStorage.setItem('access_token',  access)
    localStorage.setItem('refresh_token', refresh)
    setAccessToken(access)
  }, [])
 
  /** Wipe tokens and mark as logged-out */
  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setAccessToken(null)
  }, [])
 
  return (
    <AuthContext.Provider value={{ isLoggedIn, accessToken, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
 
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}