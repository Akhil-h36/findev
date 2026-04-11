// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [tokens, setTokens]     = useState({
    access:  localStorage.getItem('access_token')  || null,
    refresh: localStorage.getItem('refresh_token') || null,
  })

  // Persists tokens + user after login / OTP verify
  const saveAuth = ({ access, refresh, user: userData }) => {
    localStorage.setItem('access_token',  access)
    localStorage.setItem('refresh_token', refresh)
    setTokens({ access, refresh })
    setUser(userData || null)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setTokens({ access: null, refresh: null })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, tokens, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)