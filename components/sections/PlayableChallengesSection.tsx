import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, Trophy, Clock, Play, Users, Loader2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

type AcceptedChallenge = {
  id: string
  challenger: string
  challenged: string
  created_at: string
  expires_at: string
  type?: string
}

interface PlayableChallengesSectionProps {
  acceptedChallenges: AcceptedChallenge[]
  confirmWinner: (challengeId: string, winner: string) => Promise<void>
  formatTimeRemaining: (expiresAt: string) => string
  isLoading?: boolean
}

export function PlayableChallengesSection({
  acceptedChallenges,
  confirmWinner,
  formatTimeRemaining,
  isLoading = false,
}: PlayableChallengesSectionProps) {
  const { user } = useAuth()
  const [confirmingChallenge, setConfirmingChallenge] = useState<string | null>(null)

  const isExpiringSoon = (expiresAt: string) => {
    const timeRemaining = new Date(expiresAt).getTime() - new Date().getTime()
    return timeRemaining < 4 * 60 * 60 * 1000 // Less than 4 hours
  }

  // Mostrar TODOS los desafíos confirmados, no filtrar por usuario
  const playableChallenges = acceptedChallenges

  const canDeclareWinner = (challenge: AcceptedChallenge) => {
    if (!user) return false
    return challenge.challenger === user.alias || challenge.challenged === user.alias
  }

  const getOpponent = (challenge: AcceptedChallenge) => {
    if (!user) return ''
    return challenge.challenger === user.alias ? challenge.challenged : challenge.challenger
  }

  const handleConfirmWinner = async (challengeId: string, winner: string) => {
    setConfirmingChallenge(challengeId)
    try {
      await confirmWinner(challengeId, winner)
    } finally {
      setConfirmingChallenge(null)
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-blue-700 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Desafíos Listos para Jugar
        </CardTitle>
        <CardDescription className="text-green-600">
          {playableChallenges.length === 0
            ? 'No hay desafíos confirmados para jugar'
            : `${playableChallenges.length} desafío${
                playableChallenges.length > 1 ? 's' : ''
              } esperando ser jugado${playableChallenges.length > 1 ? 's' : ''}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner message="Cargando desafíos listos..." />
        ) : playableChallenges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay desafíos listos para jugar</p>
            <p className="text-sm mt-1">
              Los desafíos aparecerán aquí una vez que sean confirmados por ambos jugadores
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {playableChallenges.map(challenge => {
              const canDeclare = canDeclareWinner(challenge)
              const opponent = getOpponent(challenge)
              const isConfirming = confirmingChallenge === challenge.id

              return (
                <div
                  key={challenge.id}
                  className={`p-4 border rounded-lg ${
                    isExpiringSoon(challenge.expires_at)
                      ? 'border-red-200 bg-red-50'
                      : canDeclare
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="default"
                          className="flex items-center gap-1 bg-blue-100 text-blue-800"
                        >
                          <Play className="w-3 h-3" />
                          Listo para jugar
                        </Badge>
                        {challenge.type === 'SUGGESTION' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Sugerencia
                          </Badge>
                        )}
                        {isExpiringSoon(challenge.expires_at) && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ¡Expira pronto!
                          </Badge>
                        )}
                      </div>

                      <div className="font-medium text-gray-800">
                        <span className="text-green-600">{challenge.challenger}</span> vs{' '}
                        <span className="text-blue-600">{challenge.challenged}</span>
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        Tiempo para jugar:{' '}
                        <span className="font-medium">
                          {formatTimeRemaining(challenge.expires_at)}
                        </span>
                      </div>

                      {canDeclare && (
                        <div className="text-sm text-blue-600 mt-1 font-medium">
                          Puedes declarar el ganador después de jugar contra {opponent}
                        </div>
                      )}
                    </div>

                    {canDeclare && user && (
                      <div className="flex gap-2 sm:flex-col lg:flex-row">
                        <Button
                          size="sm"
                          onClick={() => handleConfirmWinner(challenge.id, user.alias)}
                          disabled={isConfirming}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 disabled:bg-green-300"
                        >
                          {isConfirming ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trophy className="w-4 h-4" />
                          )}
                          {isConfirming ? 'Guardando...' : 'Gané'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirmWinner(challenge.id, opponent)}
                          disabled={isConfirming}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-1 disabled:border-gray-300 disabled:text-gray-400"
                        >
                          {isConfirming ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trophy className="w-4 h-4" />
                          )}
                          {isConfirming ? 'Guardando...' : `Ganó ${opponent}`}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
