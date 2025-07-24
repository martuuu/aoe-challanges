import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, AlertCircle, Check, X, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

type Challenge = {
  id: string
  challenger: string
  challenged: string
  status: string
  created_at: string
  expires_at: string
  type?: string
  challengerStatus?: 'pending' | 'accepted' | 'rejected'
  challengedStatus?: 'pending' | 'accepted' | 'rejected'
}

interface ChallengeSectionProps {
  pendingChallenges: Challenge[]
  confirmChallenge: (challengeId: string, action: 'accept' | 'reject') => Promise<void>
  formatTimeRemaining: (expiresAt: string) => string
  isLoading?: boolean
}

export function ChallengeSection({
  pendingChallenges,
  confirmChallenge,
  formatTimeRemaining,
  isLoading = false,
}: ChallengeSectionProps) {
  const { user } = useAuth()

  const isExpiringSoon = (expiresAt: string) => {
    const timeRemaining = new Date(expiresAt).getTime() - new Date().getTime()
    return timeRemaining < 4 * 60 * 60 * 1000 // Less than 4 hours
  }

  // Filtrar solo desafíos que necesitan confirmación (no están completamente aceptados)
  const challengesNeedingConfirmation = pendingChallenges.filter(challenge => {
    // Si es una sugerencia, ambos deben haber aceptado
    if (challenge.type === 'suggestion') {
      const shouldShow =
        challenge.challengerStatus !== 'accepted' || challenge.challengedStatus !== 'accepted'
      return shouldShow
    } else {
      // Si es un desafío directo, solo el desafiado debe haber aceptado
      const shouldShow = challenge.challengedStatus !== 'accepted'
      return shouldShow
    }
  })

  const getStatusText = (challenge: Challenge) => {
    if (challenge.type === 'suggestion') {
      // Para sugerencias, ambos deben aceptar
      if (challenge.challengerStatus === 'pending' && challenge.challengedStatus === 'pending') {
        return 'Pendiente de ambos jugadores'
      }
      if (challenge.challengerStatus === 'pending') {
        return `Pendiente de confirmación de ${challenge.challenger}`
      }
      if (challenge.challengedStatus === 'pending') {
        return `Pendiente de confirmación de ${challenge.challenged}`
      }
      if (challenge.challengerStatus === 'rejected' || challenge.challengedStatus === 'rejected') {
        return 'Desafío rechazado'
      }
    } else {
      // Para desafíos directos, solo el desafiado debe aceptar
      if (challenge.challengedStatus === 'pending') {
        return `Pendiente de confirmación de ${challenge.challenged}`
      }
      if (challenge.challengedStatus === 'rejected') {
        return 'Desafío rechazado'
      }
    }

    return 'Pendiente de confirmación'
  }

  const canUserInteract = (challenge: Challenge) => {
    const isUserChallenger = user?.alias === challenge.challenger
    const isUserChallenged = user?.alias === challenge.challenged

    if (challenge.type === 'suggestion') {
      // En sugerencias, ambos pueden aceptar/rechazar si están pendientes
      return (
        (isUserChallenger && challenge.challengerStatus === 'pending') ||
        (isUserChallenged && challenge.challengedStatus === 'pending')
      )
    } else {
      // En desafíos directos, solo el desafiado puede aceptar/rechazar si está pendiente
      return isUserChallenged && challenge.challengedStatus === 'pending'
    }
  }

  const getStatusIcon = (challenge: Challenge) => {
    if (challenge.type === 'suggestion') {
      return <Users className="w-4 h-4" />
    }
    return <AlertCircle className="w-4 h-4" />
  }

  const getStatusVariant = (challenge: Challenge) => {
    if (isExpiringSoon(challenge.expires_at)) {
      return 'destructive' as const
    }
    if (challenge.type === 'suggestion') {
      return 'secondary' as const
    }
    return 'default' as const
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-green-700 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Desafíos Pendientes de Confirmación
        </CardTitle>
        <CardDescription className="text-blue-600">
          {challengesNeedingConfirmation.length === 0
            ? 'No hay desafíos pendientes de confirmación'
            : `${challengesNeedingConfirmation.length} desafío${
                challengesNeedingConfirmation.length > 1 ? 's' : ''
              } esperando confirmación. Una vez confirmados por ambos jugadores, aparecerán listos para jugar.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner message="Cargando desafíos..." />
        ) : challengesNeedingConfirmation.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay desafíos pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challengesNeedingConfirmation.map(challenge => {
              const canInteract = canUserInteract(challenge)

              return (
                <div
                  key={challenge.id}
                  className={`p-4 border rounded-lg ${
                    isExpiringSoon(challenge.expires_at)
                      ? 'border-red-200 bg-red-50'
                      : canInteract
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={getStatusVariant(challenge)}
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(challenge)}
                          {getStatusText(challenge)}
                        </Badge>
                        {isExpiringSoon(challenge.expires_at) && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ¡Expira pronto!
                          </Badge>
                        )}
                      </div>

                      <div className="font-medium text-gray-800">
                        {challenge.type === 'suggestion' ? (
                          <span>
                            Sugerencia:{' '}
                            <span className="text-green-600">{challenge.challenger}</span> vs{' '}
                            <span className="text-blue-600">{challenge.challenged}</span>
                          </span>
                        ) : (
                          <span>
                            <span className="text-green-600">{challenge.challenger}</span> desafía a{' '}
                            <span className="text-blue-600">{challenge.challenged}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        Expira en:{' '}
                        <span className="font-medium">
                          {formatTimeRemaining(challenge.expires_at)}
                        </span>
                      </div>
                    </div>

                    {canInteract && (
                      <div className="flex gap-2 sm:flex-col lg:flex-row">
                        <Button
                          size="sm"
                          onClick={() => confirmChallenge(challenge.id, 'accept')}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirmChallenge(challenge.id, 'reject')}
                          className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Rechazar
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
