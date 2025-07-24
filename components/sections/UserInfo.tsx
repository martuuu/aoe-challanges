'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogOut, User, Settings, Info } from 'lucide-react'
import { useCustomAlert } from '@/components/ui/custom-alert'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function UserInfo() {
  const { user, logout } = useAuth()
  const { showAlert } = useCustomAlert()
  const router = useRouter()
  // const [userStats, setUserStats] = useState<UserStats>({
  //   wins: 0,
  //   losses: 0,
  //   elo: 1200,
  //   streak: 0,
  //   totalMatches: 0,
  //   winRate: 0,
  // })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  // Cargar estadísticas del usuario
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/stats/user/${user.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            // setUserStats({
            //   wins: data.user.wins || 0,
            //   losses: data.user.losses || 0,
            //   elo: data.user.elo || 1200,
            //   streak: data.user.streak || 0,
            //   totalMatches: data.user.totalMatches || 0,
            //   winRate: data.user.winRate || 0,
            // })
          }
        }
      } catch (error) {
        console.error('Error loading user stats:', error)
      }
    }

    loadUserStats()
  }, [user])

  if (!user) return null

  const handleLogout = () => {
    logout()
    showAlert('Log-out exitoso')
  }

  const handleSettings = () => {
    router.push('/settings')
  }

  const handleInfo = () => {
    router.push('/info')
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
    <Card className="mb-6 border-2 border-green-600 bg-gradient-to-r from-green-50 to-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
              <User className="w-5 h-5 text-green-700" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-green-800">{user.name}!</h5>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 4 }, (_, index) => {
                  // Calcular cuántas estrellas ganadas tiene el usuario
                  // Nivel 4 = 0 estrellas, Nivel 3 = 1 estrella, Nivel 2 = 2 estrellas, Nivel 1 = 3 estrellas, Nivel 0 = 4 estrellas (oculto)
                  const earnedStars = Math.max(0, 4 - user.level)
                  const isEarned = index < earnedStars
                  const starColor = getStarColors(index, earnedStars)
                  const isHiddenStar = index === 3
                  const isMaxLevel = user.level === 0 // Nivel 0 sería el máximo con 4 estrellas

                  // Solo mostrar la 4ta estrella si la tiene
                  if (isHiddenStar && !isEarned) return null

                  return (
                    <div
                      key={index}
                      className={`${
                        isMaxLevel && isHiddenStar ? 'w-5 h-5' : 'w-4 h-4'
                      } ${starColor}`}
                    >
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

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-700 p-2"
              onClick={handleSettings}
            >
              <Settings className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="sm" className="text-green-700 p-2" onClick={handleInfo}>
              <Info className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-green-700 p-2">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
