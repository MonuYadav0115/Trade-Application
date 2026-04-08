import React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem('trade_token'))
  const [user, setUser]     = useState(() => {
    const u = localStorage.getItem('trade_user')
    return u ? JSON.parse(u) : null
  })

  const login = (accessToken, username) => {
    setToken(accessToken)
    setUser({ username })
    localStorage.setItem('trade_token', accessToken)
    localStorage.setItem('trade_user', JSON.stringify({ username }))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('trade_token')
    localStorage.removeItem('trade_user')
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)