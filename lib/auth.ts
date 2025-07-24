import { initialUsers, type User } from './initial-users'

export interface AuthUser {
  id: string // Cambiado a string para que coincida con la BD
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

// Mapeo de IDs numéricos (del initial-users) a IDs reales de la base de datos
const userIdMapping: Record<number, string> = {
  1: 'cmdff6arb0000ot83y5ebrh4k', // Bicho
  2: 'cmdff6biw0001ot83o3pnortg', // Tata
  3: 'cmdff6c9o0002ot83lyqzcxq3', // Seba
  4: 'cmdff6d0f0003ot83x9tghns8', // Dany
  5: 'cmdff6drt0004ot83w0cyf6kn', // Chaquinha
  6: 'cmdff6eij0005ot83virykjc1', // Mati
  7: 'cmdff6f9e0006ot83i4jale3k', // Pana
  8: 'cmdff6fzw0007ot83q4i2e6kg', // Ruso
  9: 'cmdff6gqj0008ot83mk7fdlm8', // Tincho
}

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
          const realUserId = userIdMapping[user.id]
          if (!realUserId) {
            reject(new Error('Error de mapeo de usuario'))
            return
          }

          const authUser: AuthUser = {
            id: realUserId, // Usar el ID real de la base de datos
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
          const user = JSON.parse(stored)

          // Verificar si el usuario tiene el formato de ID correcto (cuid vs number)
          // Si es un número, significa que es de la versión antigua, forzar logout
          if (typeof user.id === 'number') {
            this.logout()
            return null
          }

          return user
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
