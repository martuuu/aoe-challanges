import { History, Crown, Medal, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'

interface HistorySectionProps {
  recentChallenges: Array<{
    id: string
    challenger: string
    challenged: string
    status: 'pending' | 'accepted' | 'completed' | 'expired' | 'rejected' | 'cancelled'
    created_at: string
    expires_at: string
    winner?: string
    type?: string
  }>
  recentMatches: Array<{
    id: string
    winner: string
    loser: string
    created_at: string
    type: 'challenge' | 'group'
    team1?: string[]
    team2?: string[]
    winning_team?: 'team1' | 'team2'
  }>
  acceptedChallenges: Array<{
    id: string
    challenger: { alias: string }
    challenged: { alias: string }
    createdAt: Date
    expiresAt: Date
  }>
  acceptChallenge: (challengeId: string, action: string) => Promise<void>
  confirmWinner: (challengeId: string, winner: string) => Promise<void>
  formatTimeAgo: (dateString: string) => string
  formatTimeRemaining: (expiresAt: string) => string
}

export function HistorySection({
  recentChallenges,
  recentMatches,
  acceptedChallenges = [],
  acceptChallenge,
  formatTimeAgo,
  confirmWinner = async () => {},
  formatTimeRemaining,
}: HistorySectionProps) {
  const { user } = useAuth()

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      accepted: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    return variants[status as keyof typeof variants] || variants.pending
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Target className="w-3 h-3" />
      case 'accepted':
        return <Crown className="w-3 h-3" />
      case 'completed':
        return <Medal className="w-3 h-3" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'accepted':
        return 'Aceptado'
      case 'completed':
        return 'Completado'
      case 'expired':
        return 'Expirado'
      case 'rejected':
        return 'Rechazado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const isExpiringSoon = (expiresAt: string) => {
    const timeRemaining = new Date(expiresAt).getTime() - new Date().getTime()
    return timeRemaining < 4 * 60 * 60 * 1000 // Less than 4 hours
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <History className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-green-800">Historial Reciente</h2>
        </div>
        <p className="text-sm sm:text-base text-blue-700">Los últimos desafíos y partidas</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Desafíos Recientes */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-green-700 flex items-center gap-2 text-base sm:text-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Desafíos Recientes
            </CardTitle>
            <CardDescription className="text-blue-600 text-sm">
              Estado actual de los desafíos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 pt-0">
            {recentChallenges.length > 0 ? (
              recentChallenges.map(challenge => {
                const expiringSoon = isExpiringSoon(challenge.expires_at)
                const isUserChallenged = user && challenge.challenged === user.alias
                const isPendingForUser = challenge.status === 'pending' && isUserChallenged
                const isSuggestion = challenge.type === 'SUGGESTION'

                return (
                  <div
                    key={challenge.id}
                    className={`p-2 sm:p-3 rounded-lg border transition-all ${
                      isPendingForUser
                        ? expiringSoon
                          ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-300'
                          : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300'
                        : 'bg-gradient-to-r from-green-50 to-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1 sm:gap-0">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getStatusBadge(challenge.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(challenge.status)}
                            <span className="hidden xs:inline">
                              {getStatusText(challenge.status)}
                            </span>
                          </div>
                        </Badge>
                        {expiringSoon && isPendingForUser && (
                          <Badge className="text-xs bg-red-100 text-red-800 border-red-300">
                            ¡Expira pronto!
                          </Badge>
                        )}
                        {isPendingForUser && (
                          <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                            Te desafiaron
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-blue-600">
                          {formatTimeAgo(challenge.created_at)}
                        </span>
                        {isPendingForUser && (
                          <span className="text-xs text-orange-600 font-medium">
                            Expira: {formatTimeRemaining(challenge.expires_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm mb-2">
                      <span className="font-medium text-green-700">{challenge.challenger}</span>
                      <span className="text-blue-600 mx-1 sm:mx-2">vs</span>
                      <span className="font-medium text-green-700">{challenge.challenged}</span>
                      {isSuggestion && (
                        <span className="text-orange-600 ml-2 text-xs">(Sugerencia)</span>
                      )}
                    </div>
                    {challenge.winner && (
                      <div className="mt-2 text-xs text-green-600">
                        Ganador: <span className="font-medium">{challenge.winner}</span>
                      </div>
                    )}

                    {/* Botones para aceptar/rechazar desafío si está pendiente y dirigido al usuario */}
                    {isPendingForUser && (
                      <div className="flex flex-col gap-2 mt-3">
                        <button
                          onClick={() => acceptChallenge(challenge.id, 'accept')}
                          className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md text-sm font-medium"
                        >
                          ✓ Aceptar Desafío
                        </button>
                        <button
                          onClick={() => acceptChallenge(challenge.id, 'reject')}
                          className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-md text-sm"
                        >
                          ✗ Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="text-blue-500 text-center py-4">No hay desafíos recientes</p>
            )}
          </CardContent>
        </Card>

        {/* Desafíos Aceptados - Confirmar Ganador */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-green-700 flex items-center gap-2 text-base sm:text-lg">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
              Confirmar Ganador
            </CardTitle>
            <CardDescription className="text-blue-600 text-sm">
              Desafíos aceptados esperando resultado - ¿Quién ganó?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 pt-0">
            {acceptedChallenges.length > 0 ? (
              acceptedChallenges.map(challenge => (
                <div
                  key={challenge.id}
                  className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300"
                >
                  <div className="text-xs sm:text-sm mb-3 text-center">
                    <div className="text-blue-600 text-xs mb-1">¡Desafío aceptado! 🏆</div>
                    <div>
                      <span className="font-medium text-green-700">
                        {challenge.challenger.alias}
                      </span>
                      <span className="text-blue-600 mx-1 sm:mx-2">vs</span>
                      <span className="font-medium text-green-700">
                        {challenge.challenged.alias}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">¿Quién ganó la partida?</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => confirmWinner(challenge.id, challenge.challenger.alias)}
                      className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md text-sm font-medium"
                    >
                      🏆 Ganó {challenge.challenger.alias}
                    </button>
                    <button
                      onClick={() => confirmWinner(challenge.id, challenge.challenged.alias)}
                      className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md text-sm font-medium"
                    >
                      🏆 Ganó {challenge.challenged.alias}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Crown className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                <p className="text-blue-500 text-sm">No hay partidas esperando resultado</p>
                <p className="text-gray-400 text-xs mt-1">Los desafíos aceptados aparecerán aquí</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Partidas Recientes */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-green-700 flex items-center gap-2 text-base sm:text-lg">
              <Medal className="w-4 h-4 sm:w-5 sm:h-5" />
              Partidas Recientes
            </CardTitle>
            <CardDescription className="text-blue-600 text-sm">
              Resultados de las últimas partidas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 pt-0">
            {recentMatches.length > 0 ? (
              recentMatches.map(match => (
                <div
                  key={match.id}
                  className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-blue-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1 sm:gap-0">
                    <Badge className="text-xs bg-green-100 text-green-800 border-green-200 w-fit">
                      <Crown className="w-3 h-3 mr-1" />
                      {match.type === 'challenge' ? 'Individual' : 'Grupo'}
                    </Badge>
                    <span className="text-xs text-blue-600 self-start sm:self-auto">
                      {formatTimeAgo(match.created_at)}
                    </span>
                  </div>

                  {match.type === 'challenge' ? (
                    <div className="text-xs sm:text-sm">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="font-medium text-green-700">{match.winner}</span>
                        <Medal className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                        <span className="text-blue-600">venció a</span>
                        <span className="text-green-700">{match.loser}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <span className="text-blue-600">Equipo 1:</span>
                          <span className="text-green-700 break-words">
                            {match.team1?.join(', ')}
                          </span>
                        </div>
                        {match.winning_team === 'team1' && (
                          <Medal className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 self-start sm:self-auto" />
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <span className="text-blue-600">Equipo 2:</span>
                          <span className="text-green-700 break-words">
                            {match.team2?.join(', ')}
                          </span>
                        </div>
                        {match.winning_team === 'team2' && (
                          <Medal className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 self-start sm:self-auto" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-blue-500 text-center py-4">No hay partidas recientes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
