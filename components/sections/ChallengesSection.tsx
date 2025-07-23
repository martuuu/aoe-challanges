import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertCircle, Target } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface ChallengesSectionProps {
  pendingChallenges: Array<{
    id: string
    challenger: string
    challenged: string
    status: string
    created_at: string
    expires_at: string
    type?: string
    challenger_confirmed?: boolean
    challenged_confirmed?: boolean
  }>
  acceptChallenge: (challengeId: string, winner: string) => void
  formatTimeRemaining: (expiresAt: string) => string
}

export function ChallengesSection({
  pendingChallenges,
  acceptChallenge,
  formatTimeRemaining,
}: ChallengesSectionProps) {
  const { user } = useAuth()

  const isExpiringSoon = (expiresAt: string) => {
    const timeRemaining = new Date(expiresAt).getTime() - new Date().getTime()
    return timeRemaining < 4 * 60 * 60 * 1000 // Less than 4 hours
  }

  // Filtrar desafíos para mostrar solo los dirigidos al usuario logueado
  const userChallenges = user
    ? pendingChallenges.filter(challenge => challenge.challenged === user.alias)
    : []

  // Mostrar sugerencias para todos
  const suggestions = pendingChallenges.filter(challenge => challenge.type === 'SUGGESTION')

  // Combinar desafíos del usuario y sugerencias
  const displayChallenges = [...userChallenges, ...suggestions]

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-green-700 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {userChallenges.length > 0 ? 'Desafíos Dirigidos a Ti' : 'Desafíos Pendientes'}
        </CardTitle>
        <CardDescription className="text-blue-600">
          {userChallenges.length > 0
            ? 'Desafíos que requieren tu aceptación'
            : 'Desafíos y sugerencias esperando respuesta'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {displayChallenges.length > 0 ? (
          <div className="space-y-4">
            {displayChallenges.map(challenge => {
              const expiringSoon = isExpiringSoon(challenge.expires_at)
              const isUserChallenge = user && challenge.challenged === user.alias
              const isSuggestion = challenge.type === 'SUGGESTION'

              return (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    expiringSoon
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
                      : isUserChallenge
                      ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300'
                      : 'bg-gradient-to-r from-green-50 to-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          expiringSoon
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : isUserChallenge
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeRemaining(challenge.expires_at)}
                      </Badge>
                      {expiringSoon && <AlertCircle className="w-4 h-4 text-amber-600" />}
                      {isUserChallenge && <Target className="w-4 h-4 text-amber-600" />}
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-lg">
                      {isUserChallenge ? (
                        <>
                          <span className="font-bold text-amber-600">Te desafía </span>
                          <span className="font-bold text-green-700">{challenge.challenger}</span>
                          <span className="text-blue-600 mx-2">- ¿Aceptas el desafío?</span>
                        </>
                      ) : isSuggestion ? (
                        <>
                          <span className="font-bold text-orange-600">Sugerencia:</span>
                          <span className="text-blue-600 mx-2">¿Qué tal si</span>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="font-bold text-green-700">{challenge.challenger}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {challenge.challenger_confirmed ? '✓' : '✗'}
                            </span>
                            <span className="text-blue-600">vs</span>
                            <span className="font-bold text-green-700">{challenge.challenged}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {challenge.challenged_confirmed ? '✓' : '✗'}
                            </span>
                          </div>
                          <span className="text-blue-600 block mt-1">se enfrentan?</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-bold text-green-700">{challenge.challenger}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {challenge.challenger_confirmed ? '✓' : '✗'}
                            </span>
                            <span className="text-blue-600">desafía a</span>
                            <span className="font-bold text-green-700">{challenge.challenged}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {challenge.challenged_confirmed ? '✓' : '✗'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {isUserChallenge ? (
                    // Botones para cuando el usuario fue desafiado - aceptar o rechazar
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => acceptChallenge(challenge.id, 'accept')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg"
                      >
                        ✓ Aceptar Desafío
                      </button>
                      <button
                        onClick={() => acceptChallenge(challenge.id, 'reject')}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-lg"
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  ) : isSuggestion ? (
                    // Botones para sugerencias
                    <div className="space-y-2">
                      <div className="text-center text-sm text-orange-600 mb-3">
                        Ambos jugadores deben aceptar
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => acceptChallenge(challenge.id, challenge.challenger)}
                          className="px-3 py-2 bg-[#819067] text-white rounded-lg hover:bg-[#0A400C] transition-all shadow-md text-sm"
                        >
                          ✓ {challenge.challenger}
                        </button>
                        <button
                          onClick={() => acceptChallenge(challenge.id, challenge.challenged)}
                          className="px-3 py-2 bg-[#819067] text-white rounded-lg hover:bg-[#0A400C] transition-all shadow-md text-sm"
                        >
                          ✓ {challenge.challenged}
                        </button>
                      </div>
                      <button
                        onClick={() => acceptChallenge(challenge.id, 'both')}
                        className="w-full px-4 py-2 bg-[#F79B72] text-white rounded-lg hover:bg-[#F5865A] transition-all shadow-lg font-medium"
                      >
                        ¡Ambos Aceptan el Desafío!
                      </button>
                    </div>
                  ) : (
                    // Botones generales (no debería llegar aquí con la nueva lógica)
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => acceptChallenge(challenge.id, challenge.challenger)}
                        className="flex-1 px-4 py-2 bg-[#819067] text-white rounded-lg hover:bg-[#0A400C] transition-all shadow-lg"
                      >
                        {challenge.challenger} Ganó
                      </button>
                      <button
                        onClick={() => acceptChallenge(challenge.id, challenge.challenged)}
                        className="flex-1 px-4 py-2 bg-[#1B3C53] text-white rounded-lg hover:bg-[#456882] transition-all shadow-lg"
                      >
                        {challenge.challenged} Ganó
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-3" />
            <p className="text-blue-500">
              {user ? 'No tienes desafíos pendientes' : 'No hay desafíos pendientes'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
