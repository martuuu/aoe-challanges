import { History, Crown, Medal, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface HistorySectionProps {
  recentChallenges: Array<{
    id: string
    challenger: string
    challenged: string
    status: 'pending' | 'accepted' | 'completed' | 'expired'
    created_at: string
    expires_at: string
    winner?: string
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
  formatTimeAgo: (date: string) => string
}

export function HistorySection({
  recentChallenges,
  recentMatches,
  formatTimeAgo,
}: HistorySectionProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      accepted: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200',
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <History className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-green-800">Historial Reciente</h2>
        </div>
        <p className="text-sm sm:text-base text-blue-700">Los últimos desafíos y partidas</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
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
              recentChallenges.map(challenge => (
                <div
                  key={challenge.id}
                  className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-blue-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getStatusBadge(challenge.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(challenge.status)}
                          <span className="hidden xs:inline">
                            {challenge.status === 'pending' && 'Pendiente'}
                            {challenge.status === 'accepted' && 'Aceptado'}
                            {challenge.status === 'completed' && 'Completado'}
                            {challenge.status === 'expired' && 'Expirado'}
                          </span>
                        </div>
                      </Badge>
                    </div>
                    <span className="text-xs text-blue-600 self-start sm:self-auto">
                      {formatTimeAgo(challenge.created_at)}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <span className="font-medium text-green-700">{challenge.challenger}</span>
                    <span className="text-blue-600 mx-1 sm:mx-2">vs</span>
                    <span className="font-medium text-green-700">{challenge.challenged}</span>
                  </div>
                  {challenge.winner && (
                    <div className="mt-2 text-xs text-green-600">
                      Ganador: <span className="font-medium">{challenge.winner}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-blue-500 text-center py-4">No hay desafíos recientes</p>
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
                    <span className="text-xs text-blue-600 self-start sm:self-auto">{formatTimeAgo(match.created_at)}</span>
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
                          <span className="text-green-700 break-words">{match.team1?.join(', ')}</span>
                        </div>
                        {match.winning_team === 'team1' && (
                          <Medal className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 self-start sm:self-auto" />
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <span className="text-blue-600">Equipo 2:</span>
                          <span className="text-green-700 break-words">{match.team2?.join(', ')}</span>
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
