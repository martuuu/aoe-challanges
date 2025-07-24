import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { LogIn, Crown } from 'lucide-react'
import { LoginForm } from '@/components/LoginForm'
import { useAuth } from '@/hooks/useAuth'
import { usePyramid, PyramidData, PyramidUser } from '@/hooks/usePyramid'

interface PyramidSectionProps {
  pyramid?: PyramidData
  setPyramid?: React.Dispatch<React.SetStateAction<PyramidData>>
  isLoginDialogOpen: boolean
  setIsLoginDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const levelInfo = {
  1: {
    name: 'Wololo',
    badge: 'default',
    bgClass: 'bg-green-400 text-white font-bold',
    cardColor: 'bg-green-400 text-white',
  },
  2: {
    name: 'Aceptable',
    badge: 'default',
    bgClass: 'bg-green-300 text-white',
    cardColor: 'bg-green-300 text-white',
  },
  3: {
    name: 'Manquito',
    badge: 'default',
    bgClass: 'bg-green-600 text-white',
    cardColor: 'bg-green-600 text-white',
  },
  4: {
    name: 'Protesis',
    badge: 'default',
    bgClass: 'bg-green-800 text-white',
    cardColor: 'bg-green-800 text-white',
  },
} as const

export function PyramidSection({
  pyramid: externalPyramid,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setPyramid,
  isLoginDialogOpen,
  setIsLoginDialogOpen,
}: PyramidSectionProps) {
  const { user } = useAuth()
  const { pyramidData, isLoading } = usePyramid()

  // Usar datos externos si están disponibles, sino usar datos del hook
  const currentPyramid = externalPyramid || pyramidData

  const handleLoginSuccess = () => {
    setIsLoginDialogOpen(false)
  }

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-to-r from-[#819067] text-white rounded-t-xl">
          <CardTitle className="text-center">Cargando pirámide...</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#819067]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="bg-green-600 text-white rounded-t-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
              Piramide 2025
            </CardTitle>
          </div>

          {/* Botón ingresar como jugador - Solo si no está logueado */}
          {!user && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="sm:size-lg w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                  >
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Ingresar como Jugador
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4 sm:mx-0 max-w-lg">
                  <DialogTitle className="sr-only">Ingresar como Jugador</DialogTitle>
                  <DialogDescription className="sr-only">
                    Formulario para autenticarse en el sistema usando email y contraseña
                  </DialogDescription>
                  <LoginForm onSuccess={handleLoginSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 bg-gradient-to-br from-green-50/30 to-blue-50/30">
        <div className="space-y-8 sm:space-y-12">
          {Object.entries(currentPyramid).map(([level, players]) => {
            const levelNum = Number(level) as keyof typeof levelInfo
            const info = levelInfo[levelNum]

            return (
              <div key={level} className="flex flex-col items-center space-y-4 sm:space-y-6">
                {/* Header del nivel */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <Badge
                      variant={info.badge}
                      className={`text-sm sm:text-base px-3 sm:px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300 ${info.bgClass}`}
                    >
                      {info.name}
                    </Badge>
                  </div>
                </div>

                {/* Contenedor de jugadores */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  {(players as PyramidUser[]).map(player => (
                    <div
                      key={player.id}
                      className={`
                        ${info.cardColor}
                        px-4 sm:px-3 py-2 sm:py-4 
                        rounded-xl font-semibold text-sm sm:text-base
                        shadow-lg hover:shadow-xl transition-all duration-300 
                        hover:-translate-y-1 hover:scale-105
                        border border-white/20
                        min-w-[100px] text-center
                      `}
                    >
                      {level === '1' && <span className="mr-2 text-xl">👑</span>}
                      <div>{player.alias}</div>
                      <div className="text-xs opacity-75">
                        {player.wins}W - {player.losses}L
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
