import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, Trophy, Clock, Play, Users } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuth } from '@/hooks/useAuth'

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

  const isExpiringSoon = (expiresAt: string) => {
    const timeRemaining = new Date(expiresAt).getTime() - new Date().getTime()
    return timeRemaining < 4 * 60 * 60 * 1000 // Less than 4 hours
  }

  // Filtrar solo desafíos donde el usuario logueado puede declarar ganador
  const userPlayableChallenges = user
    ? acceptedChallenges.filter(
        challenge => challenge.challenger === user.alias || challenge.challenged === user.alias
      )
    : acceptedChallenges

  const canDeclareWinner = (challenge: AcceptedChallenge) => {
    if (!user) return false
    return challenge.challenger === user.alias || challenge.challenged === user.alias
  }

  const getOpponent = (challenge: AcceptedChallenge) => {
    if (!user) return ''
    return challenge.challenger === user.alias ? challenge.challenged : challenge.challenger
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-blue-700 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Desafíos Listos para Jugar
        </CardTitle>
        <CardDescription className="text-green-600">
          {userPlayableChallenges.length === 0
            ? 'No hay desafíos confirmados para jugar'
            : `${userPlayableChallenges.length} desafío${
                userPlayableChallenges.length > 1 ? 's' : ''
              } esperando ser jugado${userPlayableChallenges.length > 1 ? 's' : ''}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner message="Cargando desafíos listos..." />
        ) : userPlayableChallenges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay desafíos listos para jugar</p>
            <p className="text-sm mt-1">
              Los desafíos aparecerán aquí una vez que sean confirmados por ambos jugadores
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userPlayableChallenges.map(challenge => {
              const canDeclare = canDeclareWinner(challenge)
              const opponent = getOpponent(challenge)

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
                          onClick={() => confirmWinner(challenge.id, user.alias)}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                        >
                          <Trophy className="w-4 h-4" />
                          Gané
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirmWinner(challenge.id, opponent)}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                        >
                          <Trophy className="w-4 h-4" />
                          Ganó {opponent}
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
