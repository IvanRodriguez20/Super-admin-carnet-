import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '../services/authService'
import { TOKEN_KEY, USER_KEY } from '../services/api'

const AuthContext = createContext(null)

const readUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(readUser)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))

  const login = useCallback(async (document, password) => {
    const data = await authService.login(document, password)
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
