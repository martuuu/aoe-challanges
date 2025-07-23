import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogOut, User, Settings, Info } from 'lucide-react'

export function UserInfo() {
  const { user, logout } = useAuth()

  if (!user) return null

  const getLevelInfo = (level: number) => {
    const levelConfig = {
      1: { name: 'El lechero', color: 'bg-yellow-500 text-white', icon: '👑' },
      2: { name: 'Protesis Ok', color: 'bg-green-600 text-white', icon: '⚡' },
      3: { name: 'Construyo mas atras', color: 'bg-blue-600 text-white', icon: '📈' },
      4: { name: 'manco juga a otra cosa', color: 'bg-orange-500 text-white', icon: '💀' },
    }
    return levelConfig[level as keyof typeof levelConfig] || levelConfig[3]
  }

  const levelInfo = getLevelInfo(user.level)

  return (
    <Card className="mb-6 border-2 border-green-600 bg-gradient-to-r from-green-50 to-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <User className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h3 className="font-bold text-green-800">Bienvenido, {user.name}!</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${levelInfo.color}`}>
                  {levelInfo.icon} Nivel {user.level}: {levelInfo.name}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled
              className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              <Info className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
