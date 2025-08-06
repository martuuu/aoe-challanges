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
import { LogIn, Crown, Table, Trophy } from 'lucide-react'
import { LoginForm } from '@/components/LoginForm'
import { useAuth } from '@/hooks/useAuth'
import { usePyramid, PyramidData, PyramidUser } from '@/hooks/usePyramid'
import { useState } from 'react'

type ViewType = 'pyramid' | 'table' | 'elo'

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
  const [currentView, setCurrentView] = useState<ViewType>('pyramid')

  // Usar datos externos si están disponibles, sino usar datos del hook
  const currentPyramid = externalPyramid || pyramidData

  const handleLoginSuccess = () => {
    setIsLoginDialogOpen(false)
  }

  // Convertir datos de pirámide a lista plana para tablas
  const getAllPlayers = (): PyramidUser[] => {
    const allPlayers: PyramidUser[] = []
    Object.values(currentPyramid).forEach(levelPlayers => {
      allPlayers.push(...levelPlayers)
    })
    return allPlayers
  }

  // Ordenar jugadores por victorias (tabla de posiciones)
  const getPlayersByWins = (): PyramidUser[] => {
    return getAllPlayers().sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      return b.winRate - a.winRate
    })
  }

  // Ordenar jugadores por ELO
  const getPlayersByElo = (): PyramidUser[] => {
    return getAllPlayers().sort((a, b) => b.elo - a.elo)
  }

  // Componente para vista de tabla de posiciones
  const TableView = () => {
    const players = getPlayersByWins()
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-6 gap-4 p-3 bg-green-100 rounded-lg font-semibold text-green-800 text-sm">
          <div className="text-center">#</div>
          <div className="text-left col-span-2">Jugador</div>
          <div className="text-center">Victorias</div>
          <div className="text-center">Derrotas</div>
          <div className="text-center">Win Rate</div>
        </div>
        {players.map((player, index) => (
          <div
            key={player.id}
            className="grid grid-cols-6 gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="text-center font-bold text-green-600">{index + 1}</div>
            <div className="col-span-2 flex items-center gap-2">
              {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
              <span className="font-medium">{player.alias}</span>
              <Badge variant="outline" className="text-xs">
                Nivel {player.level}
              </Badge>
            </div>
            <div className="text-center font-semibold text-green-600">{player.wins}</div>
            <div className="text-center text-red-600">{player.losses}</div>
            <div className="text-center font-medium">{player.winRate.toFixed(1)}%</div>
          </div>
        ))}
      </div>
    )
  }

  // Componente para vista de ranking ELO
  const EloView = () => {
    const players = getPlayersByElo()
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-6 gap-4 p-3 bg-purple-100 rounded-lg font-semibold text-purple-800 text-sm">
          <div className="text-center">#</div>
          <div className="text-left col-span-2">Jugador</div>
          <div className="text-center">ELO</div>
          <div className="text-center">Partidas</div>
          <div className="text-center">Racha</div>
        </div>
        {players.map((player, index) => (
          <div
            key={player.id}
            className="grid grid-cols-6 gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="text-center font-bold text-purple-600">{index + 1}</div>
            <div className="col-span-2 flex items-center gap-2">
              {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
              <span className="font-medium">{player.alias}</span>
              <Badge variant="outline" className="text-xs">
                Nivel {player.level}
              </Badge>
            </div>
            <div className="text-center font-bold text-purple-600">{player.elo}</div>
            <div className="text-center text-gray-600">{player.totalMatches}</div>
            <div
              className={`text-center font-medium ${
                player.streak > 0
                  ? 'text-green-600'
                  : player.streak < 0
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {player.streak > 0 ? `+${player.streak}` : player.streak}
            </div>
          </div>
        ))}
      </div>
    )
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
              {currentView === 'pyramid' && 'Pirámide 2025'}
              {currentView === 'table' && 'Tabla de Posiciones'}
              {currentView === 'elo' && 'Ranking ELO'}
            </CardTitle>

            {/* Selector de vistas */}
            <div className="flex bg-white/10 rounded-lg p-1 gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('pyramid')}
                className={`px-3 py-1 text-xs ${
                  currentView === 'pyramid'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Crown className="w-3 h-3 mr-1" />
                Pirámide
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('table')}
                className={`px-3 py-1 text-xs ${
                  currentView === 'table'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Table className="w-3 h-3 mr-1" />
                Tabla
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('elo')}
                className={`px-3 py-1 text-xs ${
                  currentView === 'elo'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trophy className="w-3 h-3 mr-1" />
                ELO
              </Button>
            </div>
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
        {currentView === 'pyramid' && (
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
        )}

        {currentView === 'table' && <TableView />}
        {currentView === 'elo' && <EloView />}
      </CardContent>
    </Card>
  )
}
