import { Swords, Users, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DragDropGroupMatch } from '@/components/DragDropGroupMatch'
import { useAuth } from '@/hooks/useAuth'

interface ActionButtonsProps {
  isDialogOpen: boolean
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  isGroupMatchDialogOpen: boolean
  setIsGroupMatchDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  isSuggestDialogOpen?: boolean
  setIsSuggestDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>
  selectedChallenger: string
  setSelectedChallenger: React.Dispatch<React.SetStateAction<string>>
  selectedChallenged: string
  setSelectedChallenged: React.Dispatch<React.SetStateAction<string>>
  allPlayers: string[]
  getAvailableOpponents: (player: string) => string[]
  getHeadToHead: (player1: string, player2: string) => string
  createChallenge: () => void
  createSuggestion?: () => void
  handleCreateGroupMatch: (team1: string[], team2: string[], winner: 'team1' | 'team2') => void
}

export function ActionButtons({
  isDialogOpen,
  setIsDialogOpen,
  isGroupMatchDialogOpen,
  setIsGroupMatchDialogOpen,
  isSuggestDialogOpen = false,
  setIsSuggestDialogOpen = () => {},
  selectedChallenger,
  setSelectedChallenger,
  selectedChallenged,
  setSelectedChallenged,
  allPlayers,
  getAvailableOpponents,
  getHeadToHead,
  createChallenge,
  createSuggestion = () => {},
  handleCreateGroupMatch,
}: ActionButtonsProps) {
  const { user } = useAuth()

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="bg-[#819067] hover:bg-[#0A400C] text-white shadow-lg w-full sm:w-auto"
            disabled={!user}
          >
            <Swords className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Desafío Individual
          </Button>
        </DialogTrigger>
        <DialogContent className="mx-2 sm:mx-4 w-[calc(100vw-1rem)] sm:w-auto max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-700 text-lg sm:text-xl">
              Nuevo Desafío Individual
            </DialogTitle>
            <DialogDescription className="text-blue-600 text-sm">
              {user
                ? `${user.alias} desafiará al oponente seleccionado. El desafiado tendrá 24 horas para responder.`
                : 'Debes iniciar sesión para crear desafíos.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            {user && (
              <>
                <div>
                  <Label className="text-sm font-medium text-green-700 mb-1 block">
                    Desafiante
                  </Label>
                  <div className="w-full p-2 border border-green-200 rounded-md bg-green-50 text-green-800 font-medium">
                    {user.alias} (Tú)
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-700 mb-1 block">Oponente</Label>
                  <Select value={selectedChallenged} onValueChange={setSelectedChallenged}>
                    <SelectTrigger className="w-full border-green-200 focus:border-green-400 focus:ring-green-200">
                      <SelectValue placeholder="Selecciona tu oponente" />
                    </SelectTrigger>
                    <SelectContent>
                      {user &&
                        getAvailableOpponents(user.alias).map(player => (
                          <SelectItem key={player} value={player}>
                            <div className="flex items-center justify-between w-full">
                              <span>{player}</span>
                              {getHeadToHead(user.alias, player) !== '0-0' && (
                                <span className="text-blue-500 ml-2 text-xs">
                                  ({getHeadToHead(user.alias, player)})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    createChallenge()
                  }}
                  disabled={!selectedChallenged}
                  className="w-full bg-[#819067] hover:bg-[#0A400C] text-white h-10 sm:h-11 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear Desafío
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Botón Sugerir Desafío */}
      <Dialog open={isSuggestDialogOpen} onOpenChange={setIsSuggestDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="shadow-lg w-full sm:w-auto bg-[#F79B72] hover:bg-[#F5865A] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!user}
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Sugerir Desafío
          </Button>
        </DialogTrigger>
        <DialogContent className="mx-2 sm:mx-4 w-[calc(100vw-1rem)] sm:w-auto max-w-md">
          <DialogHeader>
            <DialogTitle className="text-orange-600 text-lg sm:text-xl">
              Sugerir Desafío
            </DialogTitle>
            <DialogDescription className="text-blue-600 text-sm">
              {user
                ? 'Sugiere un desafío entre dos jugadores. Ambos deberán aceptar la sugerencia.'
                : 'Debes iniciar sesión para sugerir desafíos.'}
            </DialogDescription>
          </DialogHeader>
          {user && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-sm font-medium text-orange-600 mb-1 block">Jugador 1</Label>
                <Select value={selectedChallenger} onValueChange={setSelectedChallenger}>
                  <SelectTrigger className="w-full border-orange-200 focus:border-orange-400 focus:ring-orange-200">
                    <SelectValue placeholder="Selecciona el primer jugador" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPlayers
                      .filter(player => player !== user.alias)
                      .map(player => (
                        <SelectItem key={player} value={player}>
                          {player}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-orange-600 mb-1 block">Jugador 2</Label>
                <Select
                  value={selectedChallenged}
                  onValueChange={setSelectedChallenged}
                  disabled={!selectedChallenger}
                >
                  <SelectTrigger className="w-full border-orange-200 focus:border-orange-400 focus:ring-orange-200 disabled:bg-gray-50">
                    <SelectValue placeholder="Selecciona el segundo jugador" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedChallenger &&
                      allPlayers
                        .filter(p => p !== selectedChallenger && p !== user.alias)
                        .map(player => (
                          <SelectItem key={player} value={player}>
                            <div className="flex items-center justify-between w-full">
                              <span>{player}</span>
                              {getHeadToHead(selectedChallenger, player) !== '0-0' && (
                                <span className="text-blue-500 ml-2 text-xs">
                                  ({getHeadToHead(selectedChallenger, player)})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => {
                  createSuggestion()
                }}
                disabled={!selectedChallenger || !selectedChallenged}
                className="w-full bg-[#F79B72] hover:bg-[#F5865A] text-white h-10 sm:h-11 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Sugerencia
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isGroupMatchDialogOpen} onOpenChange={setIsGroupMatchDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            variant="outline"
            className="shadow-lg w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!user}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Cargar Partida en Grupo
          </Button>
        </DialogTrigger>
        <DialogContent className="mx-2 sm:mx-4 w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-700 text-lg sm:text-xl">
              Cargar Resultado de Partida en Grupo
            </DialogTitle>
            <DialogDescription className="text-blue-600 text-sm">
              {user
                ? 'Arrastra jugadores para formar equipos y selecciona el ganador'
                : 'Debes iniciar sesión para cargar partidas en grupo.'}
            </DialogDescription>
          </DialogHeader>
          {user && (
            <DragDropGroupMatch allPlayers={allPlayers} onCreateMatch={handleCreateGroupMatch} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
