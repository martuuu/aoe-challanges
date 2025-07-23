import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { User } from '@prisma/client'

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

// Funciones de autenticación con Prisma
export const authService = {
  // Login del usuario
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      })

      if (!user || !user.isActive) {
        throw new Error('Usuario no encontrado o inactivo')
      }

      const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

      if (!isPasswordValid) {
        throw new Error('Contraseña incorrecta')
      }

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

      return authUser
    } catch (error) {
      console.error(
        '❌ Error en authService.login:',
        error instanceof Error ? error.message : 'Error desconocido'
      )
      throw new Error(error instanceof Error ? error.message : 'Error de autenticación')
    }
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
        } catch (error) {
          console.error('❌ Error parsing localStorage user:', error)
          localStorage.removeItem('aoe-auth-user')
          return null
        }
      }
    }
    return null
  },

  // Verificar si el usuario actual sigue siendo válido en la DB
  async validateCurrentUser(userId: string): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('aoe-auth-user')
        }
        return null
      }

      if (!user.isActive) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('aoe-auth-user')
        }
        return null
      }

      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        alias: user.alias,
        level: user.level,
        isAuthenticated: true,
      }

      return authUser
    } catch (error) {
      console.error('❌ Error validando usuario:', error)
      return null
    }
  },

  // Verificar si el email existe
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })
      return !!user
    } catch {
      return false
    }
  },

  // Obtener todos los usuarios (para admin)
  async getAllUsers(): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        where: { isActive: true },
        orderBy: [{ level: 'asc' }, { elo: 'desc' }],
      })
    } catch {
      return []
    }
  },

  // Actualizar usuario
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data: updates,
      })
    } catch {
      throw new Error('Error al actualizar usuario')
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
