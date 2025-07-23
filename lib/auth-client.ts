// Servicio de autenticación para el frontend que se comunica con las APIs
export interface AuthUser {
  id: string
  name: string
  email: string
  alias: string
  level: number
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
}

// Funciones de autenticación que se comunican con el backend
export const clientAuthService = {
  // Login del usuario via API
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error de autenticación')
    }

    const authUser = data.user

    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('aoe-auth-user', JSON.stringify(authUser))
    }

    return authUser
  },

  // Logout del usuario
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aoe-auth-user')
    }
  },

  // Obtener usuario actual de localStorage
  getCurrentUser(): AuthUser | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aoe-auth-user')
      if (stored) {
        try {
          const user = JSON.parse(stored)

          // Verificar si el usuario tiene el formato de ID correcto
          if (typeof user.id === 'number') {
            this.logout()
            return null
          }

          return user
        } catch {
          localStorage.removeItem('aoe-auth-user')
          return null
        }
      }
    }
    return null
  },

  // Verificar si el usuario actual sigue siendo válido en la DB (via API)
  async validateCurrentUser(userId: string): Promise<AuthUser | null> {
    try {
      const response = await fetch(`/api/auth/validate/${userId}`)

      if (!response.ok) {
        this.logout()
        return null
      }

      const data = await response.json()

      if (!data.success || !data.user) {
        this.logout()
        return null
      }

      return data.user
    } catch (error) {
      console.error('❌ ClientAuth: Error validando usuario:', error)
      return null
    }
  },
}

// Utilidades de validación
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length > 0
}
