import { initialUsers, type User } from './initial-users'

export interface AuthUser {
  id: number
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

// Simula una base de datos en memoria (temporal)
// En producción esto se reemplazará por Supabase
const usersDB: User[] = [...initialUsers]

// Funciones de autenticación
export const authService = {
  // Login del usuario
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = usersDB.find(
          u => u.email === credentials.email && u.password === credentials.password
        )

        if (user) {
          const authUser: AuthUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            alias: user.alias,
            level: user.level,
            isAuthenticated: true,
          }

          // Guardar en localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('aoe-auth-user', JSON.stringify(authUser))
          }

          resolve(authUser)
        } else {
          reject(new Error('Email o contraseña incorrectos'))
        }
      }, 500) // Simula delay de red
    })
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
          return JSON.parse(stored)
        } catch {
          return null
        }
      }
    }
    return null
  },

  // Verificar si el email existe
  async checkEmailExists(email: string): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        const exists = usersDB.some(u => u.email === email)
        resolve(exists)
      }, 300)
    })
  },

  // Obtener todos los usuarios (para admin)
  async getAllUsers(): Promise<User[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([...usersDB])
      }, 200)
    })
  },

  // Actualizar usuario
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = usersDB.findIndex(u => u.id === id)
        if (userIndex !== -1) {
          // Crear una nueva copia del array con el usuario actualizado
          const updatedUser = { ...usersDB[userIndex], ...updates }
          // En lugar de mutar, creamos un nuevo array (esto se manejará mejor con Supabase)
          console.log('Usuario actualizado:', updatedUser)
          resolve(updatedUser)
        } else {
          reject(new Error('Usuario no encontrado'))
        }
      }, 300)
    })
  },
}

// Hook personalizado para manejar autenticación
export const useAuth = () => {
  // Esto se implementará como un hook de React en el componente
  // Por ahora solo exportamos las funciones
  return {
    login: authService.login,
    logout: authService.logout,
    getCurrentUser: authService.getCurrentUser,
    checkEmailExists: authService.checkEmailExists,
  }
}

// Utilidades de validación
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  // Por ahora solo verificamos que no esté vacío
  // En el futuro podemos agregar más validaciones
  return password.length > 0
}
