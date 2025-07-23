import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, Users, X, Clock, Trophy } from 'lucide-react'

type Match = {
  id: string
  winner?: {
    id: string
    name: string
    alias: string
    level: number
  } | null
  loser?: {
    id: string
    name: string
    alias: string
    level: number
  } | null
  completedAt: string
  type: 'challenge' | 'group'
  team1?: string[]
  team2?: string[]
  winning_team?: 'team1' | 'team2'
}

type CancelledChallenge = {
  id: string
  challenger: string
  challenged: string
  status: 'expired' | 'rejected' | 'cancelled'
  created_at: string
  expires_at?: string
  type?: string
  rejectedBy?: string
  cancelledBy?: string
}

interface RecentMatchesProps {
  recentMatches: Match[]
  cancelledChallenges?: CancelledChallenge[]
  formatTimeAgo: (dateString: string) => string
}

export function RecentMatches({
  recentMatches,
  cancelledChallenges = [],
  formatTimeAgo,
}: RecentMatchesProps) {
  const getMatchResultDisplay = (match: Match) => {
    if (match.type === 'group') {
      if (match.team1 && match.team2 && match.winning_team) {
        const winningTeam = match.winning_team === 'team1' ? match.team1 : match.team2
        const losingTeam = match.winning_team === 'team1' ? match.team2 : match.team1

        return (
          <div>
            <div className="font-medium">
              <span className="text-green-600">{winningTeam.join(', ')}</span>
              <span className="mx-2">vs</span>
              <span className="text-red-500">{losingTeam.join(', ')}</span>
            </div>
            <div className="text-sm text-gray-600">Ganaron: {winningTeam.join(', ')}</div>
          </div>
        )
      }
    } else {
      // Individual challenge
      if (match.winner && match.loser) {
        return (
          <div>
            <div className="font-medium">
              <span className="text-green-600">{match.winner.alias}</span>
              <span className="mx-2">vs</span>
              <span className="text-red-500">{match.loser.alias}</span>
            </div>
            <div className="text-sm text-gray-600">Ganador: {match.winner.alias}</div>
          </div>
        )
      }
    }

    return <div className="text-gray-500">Información incompleta</div>
  }

  const getCancelledDisplay = (cancelled: CancelledChallenge) => {
    const getStatusInfo = () => {
      switch (cancelled.status) {
        case 'expired':
          return {
            text: 'Expirado',
            variant: 'secondary' as const,
            icon: <Clock className="w-3 h-3" />,
            description: 'El tiempo para confirmar expiró',
          }
        case 'rejected':
          return {
            text: 'Rechazado',
            variant: 'destructive' as const,
            icon: <X className="w-3 h-3" />,
            description: cancelled.rejectedBy
              ? `Rechazado por ${cancelled.rejectedBy}`
              : 'Desafío rechazado',
          }
        case 'cancelled':
          return {
            text: 'Cancelado',
            variant: 'outline' as const,
            icon: <X className="w-3 h-3" />,
            description: cancelled.cancelledBy
              ? `Cancelado por ${cancelled.cancelledBy}`
              : 'Desafío cancelado',
          }
        default:
          return {
            text: 'Finalizado',
            variant: 'secondary' as const,
            icon: <X className="w-3 h-3" />,
            description: 'Desafío finalizado sin jugar',
          }
      }
    }

    const statusInfo = getStatusInfo()

    return (
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
            {statusInfo.icon}
            {statusInfo.text}
          </Badge>
          {cancelled.type === 'SUGGESTION' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Sugerencia
            </Badge>
          )}
        </div>
        <div className="font-medium text-gray-800">
          {cancelled.type === 'SUGGESTION' ? (
            <>
              Sugerencia: <span className="text-blue-600">{cancelled.challenger}</span> vs{' '}
              <span className="text-blue-600">{cancelled.challenged}</span>
            </>
          ) : (
            <>
              <span className="text-blue-600">{cancelled.challenger}</span> desafió a{' '}
              <span className="text-blue-600">{cancelled.challenged}</span>
            </>
          )}
        </div>
        <div className="text-sm text-gray-600">{statusInfo.description}</div>
      </div>
    )
  }

  // Combinar matches y desafíos cancelados para mostrar en orden cronológico
  const allRecentActivity = [
    ...recentMatches.map(match => ({
      id: match.id,
      type: 'match' as const,
      data: match,
      timestamp: match.completedAt,
    })),
    ...cancelledChallenges.map(cancelled => ({
      id: cancelled.id,
      type: 'cancelled' as const,
      data: cancelled,
      timestamp: cancelled.expires_at || cancelled.created_at,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-green-700 flex items-center gap-2">
          <History className="w-5 h-5" />
          Partidas Recientes
        </CardTitle>
        <CardDescription className="text-blue-600">
          {allRecentActivity.length === 0
            ? 'No hay partidas recientes'
            : `${allRecentActivity.length} partida${
                allRecentActivity.length > 1 ? 's' : ''
              } reciente${allRecentActivity.length > 1 ? 's' : ''}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {allRecentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay partidas recientes</p>
            <p className="text-sm mt-1">Las partidas finalizadas aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allRecentActivity.map(activity => (
              <div key={activity.id} className="p-4 border rounded-lg border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    {activity.type === 'match' ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="default"
                            className="flex items-center gap-1 bg-green-100 text-green-800"
                          >
                            <Trophy className="w-3 h-3" />
                            Partida finalizada
                          </Badge>
                          {activity.data.type === 'group' && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Grupo
                            </Badge>
                          )}
                        </div>
                        {getMatchResultDisplay(activity.data)}
                      </div>
                    ) : (
                      getCancelledDisplay(activity.data)
                    )}

                    <div className="text-sm text-gray-500 mt-2">
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
