import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lc_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const login = (userData, token) => {
    localStorage.setItem('lc_token', token)
    localStorage.setItem('lc_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('lc_token')
    localStorage.removeItem('lc_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
