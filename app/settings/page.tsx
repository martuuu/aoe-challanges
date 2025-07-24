'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User, Key, Shield, Info, RefreshCw } from 'lucide-react'
import { useCustomAlert } from '@/components/ui/custom-alert'
import { useState, useEffect, useCallback } from 'react'
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
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const router = useRouter()

  // Cargar estadísticas del usuario
  const loadUserStats = useCallback(async () => {
    if (!user) return

    try {
      setIsLoadingStats(true)
      const response = await fetch(`/api/stats/user/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('User stats response:', data) // Debug

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
    } finally {
      setIsLoadingStats(false)
    }
  }, [user])

  useEffect(() => {
    loadUserStats()
  }, [user, loadUserStats])

  const handleRefreshStats = () => {
    loadUserStats()
    showAlert('Estadísticas actualizadas')
  }

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
                <Label className="text-sm font-medium text-green-800">Nombre</Label>
                <div className="mt-1 p-2 bg-green-50 rounded-md border border-green-200 text-green-900">
                  {user.name}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-green-800">Alias</Label>
                <div className="mt-1 p-2 bg-green-50 rounded-md border border-green-200 text-green-900">
                  {user.alias}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-green-800">Nivel</Label>
                <div className="mt-1 p-2 bg-green-50 rounded-md border border-green-200 text-green-900">
                  {user.level}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-green-800">Estrellas</Label>
                <div className="mt-1 p-2 bg-green-50 rounded-md border border-green-200 flex items-center gap-1">
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
        <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Estadísticas de Juego
              </CardTitle>
              <Button
                onClick={handleRefreshStats}
                variant="outline"
                size="sm"
                disabled={isLoadingStats}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
                {isLoadingStats ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{userStats.wins}</div>
                <div className="text-sm text-green-600">Victorias</div>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-800">{userStats.losses}</div>
                <div className="text-sm text-green-700">Derrotas</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{userStats.elo}</div>
                <div className="text-sm text-green-600">ELO Rating</div>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-800">
                  {userStats.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">Win Rate</div>
              </div>
            </div>
            <div className="mt-4 text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-semibold text-green-700">
                Racha Actual: {userStats.streak >= 0 ? '+' : ''}
                {userStats.streak}
              </div>
              <div className="text-sm text-green-600">
                {userStats.streak > 0
                  ? 'Victorias consecutivas'
                  : userStats.streak < 0
                  ? 'Derrotas consecutivas'
                  : 'Sin racha'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cambiar Contraseña */}
        <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Cambiar Contraseña
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium text-green-800">
                Nueva Contraseña
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1 border-green-200 focus:border-green-400 focus:ring-green-400"
                placeholder="Ingresa tu nueva contraseña"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-green-800">
                Confirmar Contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="mt-1 border-green-200 focus:border-green-400 focus:ring-green-400"
                placeholder="Confirma tu nueva contraseña"
                disabled
              />
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                <Info className="w-4 h-4 inline mr-1" />
                La funcionalidad de cambio de contraseña estará disponible próximamente.
              </p>
            </div>
            <Button
              onClick={handlePasswordReset}
              disabled={true}
              className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              Actualizar Contraseña (Próximamente)
            </Button>
          </CardContent>
        </Card>

        {/* Cerrar Sesión */}
        <Card className="border-green-300 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Button
              onClick={handleLogout}
              className="w-full bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
            >
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
