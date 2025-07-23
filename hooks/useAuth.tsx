'use client'

import { useState, useEffect, useContext, createContext, type ReactNode } from 'react'
import { clientAuthService, type AuthUser, type LoginCredentials } from '../lib/auth-client'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar si hay un usuario logueado al cargar
  useEffect(() => {
    const validateStoredUser = async () => {
      const currentUser = clientAuthService.getCurrentUser()

      if (currentUser) {
        // Verificar si el usuario sigue siendo válido en la base de datos
        try {
          const validatedUser = await clientAuthService.validateCurrentUser(currentUser.id)
          setUser(validatedUser)
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    validateStoredUser()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      setError(null)
      const authUser = await clientAuthService.login(credentials)
      setUser(authUser)
      // Refresh la página para actualizar todo el estado
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clientAuthService.logout()
    setUser(null)
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
