'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User, Key, Shield } from 'lucide-react'
import { useCustomAlert } from '@/components/ui/custom-alert'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserStats {
  wins: number
  losses: number
  elo: number
  streak: number
  totalMatches: number
  winRate: number
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { showAlert } = useCustomAlert()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userStats, setUserStats] = useState<UserStats>({
    wins: 0,
    losses: 0,
    elo: 1200,
    streak: 0,
    totalMatches: 0,
    winRate: 0,
  })
  const router = useRouter()

  // Cargar estadísticas del usuario
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/stats/user/${user.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUserStats({
              wins: data.user.wins || 0,
              losses: data.user.losses || 0,
              elo: data.user.elo || 1200,
              streak: data.user.streak || 0,
              totalMatches: data.user.totalMatches || 0,
              winRate: data.user.winRate || 0,
            })
          }
        }
      } catch (error) {
        console.error('Error loading user stats:', error)
      }
    }

    loadUserStats()
  }, [user])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) return null

  const handlePasswordReset = () => {
    if (!newPassword.trim()) {
      showAlert('Por favor ingresa una nueva contraseña')
      return
    }

    if (newPassword !== confirmPassword) {
      showAlert('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      showAlert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    // TODO: Implementar cambio de contraseña
    showAlert('Contraseña actualizada exitosamente')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleLogout = () => {
    logout()
    showAlert('Log-out exitoso')
    router.push('/')
  }

  // Función para obtener colores de estrellas
  const getStarColors = (index: number, earnedStars: number) => {
    if (index >= earnedStars) return 'text-gray-300' // No ganada

    switch (index) {
      case 0:
        return 'text-amber-600' // Bronce
      case 1:
        return 'text-gray-400' // Plata
      case 2:
        return 'text-yellow-500' // Oro
      case 3:
        return 'text-cyan-400' // Diamante (estrella oculta)
      default:
        return 'text-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-green-700 hover:bg-green-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-green-800">Configuración</h1>
        </div>

        {/* Información Personal */}
        <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Nombre</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md border text-gray-800">
                  {user.name}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Alias</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md border text-gray-800">
                  {user.alias}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Nivel</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md border text-gray-800">
                  {user.level}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Estrellas</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md border flex items-center gap-1">
                  {Array.from({ length: 4 }, (_, index) => {
                    const earnedStars = Math.max(0, 4 - user.level)
                    const isEarned = index < earnedStars
                    const starColor = getStarColors(index, earnedStars)
                    const isHiddenStar = index === 3

                    if (isHiddenStar && !isEarned) return null

                    return (
                      <div key={index} className={`w-4 h-4 ${starColor}`}>
                        <svg
                          viewBox="0 0 24 24"
                          fill={isEarned ? 'currentColor' : 'white'}
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-full h-full"
                        >
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card className="border-blue-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userStats.wins}</div>
                <div className="text-sm text-green-600">Victorias</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{userStats.losses}</div>
                <div className="text-sm text-red-600">Derrotas</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userStats.elo}</div>
                <div className="text-sm text-blue-600">ELO</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {userStats.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-purple-600">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cambiar Contraseña */}
        <Card className="border-orange-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Cambiar Contraseña
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                Nueva Contraseña
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1"
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="mt-1"
                placeholder="Confirma tu nueva contraseña"
              />
            </div>
            <Button
              onClick={handlePasswordReset}
              disabled={!newPassword || !confirmPassword}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Actualizar Contraseña
            </Button>
          </CardContent>
        </Card>

        {/* Cerrar Sesión */}
        <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
