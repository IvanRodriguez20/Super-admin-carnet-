import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { superAdminService } from '../services/superAdminService'
import { useAuth } from './AuthContext'

/**
 * Estado global de la plataforma (overview), compartido por el sidebar,
 * el buscador y las páginas, para que todo se refresque a la vez.
 */
const PlatformContext = createContext(null)

export function PlatformProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      setOverview(await superAdminService.overview())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) refresh()
  }, [isAuthenticated, refresh])

  return (
    <PlatformContext.Provider value={{ overview, universities: overview?.universities || [], loading, error, refresh }}>
      {children}
    </PlatformContext.Provider>
  )
}

export const usePlatform = () => useContext(PlatformContext)
