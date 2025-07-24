import { TrendingUp, TrendingDown, Zap, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingWidget } from '@/components/ui/loading'
import { useMonthlyStatsOptimized } from '@/hooks/useMonthlyStatsOptimized'

export function StatsWidgets() {
  const { stats: monthStats, isLoading, error } = useMonthlyStatsOptimized()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <LoadingWidget />
        <LoadingWidget />
        <LoadingWidget />
        <LoadingWidget />
      </div>
    )
  }

  if (error || !monthStats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-200 rounded-full">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-300 rounded"></div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-green-600 font-medium">Sin datos</div>
                  <div className="font-bold text-sm sm:text-base text-green-700">-</div>
                  <div className="text-xs text-green-500">No disponible</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Más Ganador - Verde claro */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-card transition-all duration-300">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-full">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-green-600 font-medium">Más Ganador</div>
              <div className="font-bold text-sm sm:text-base text-green-700">
                {monthStats.topWinner.name || 'Sin datos'}
              </div>
              <div className="text-xs text-green-500">{monthStats.topWinner.wins} victorias</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Más Perdedor - Verde medio */}
      <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 hover:shadow-card transition-all duration-300">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-600 to-green-700 rounded-full">
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-green-700 font-medium">Más Perdedor</div>
              <div className="font-bold text-sm sm:text-base text-green-800">
                {monthStats.topLoser.name || 'Sin datos'}
              </div>
              <div className="text-xs text-green-600">{monthStats.topLoser.losses} derrotas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mayor Racha - Verde medio-oscuro */}
      <Card className="bg-gradient-to-br from-green-200 to-green-300 border-green-400 hover:shadow-card transition-all duration-300">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-700 to-green-800 rounded-full">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-green-700 font-medium">Mayor Racha</div>
              <div className="font-bold text-sm sm:text-base text-green-800">
                {monthStats.bestStreak.name || 'Sin datos'}
              </div>
              <div className="text-xs text-green-600">{monthStats.bestStreak.streak} seguidas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Más Escalador - Verde oscuro */}
      <Card className="bg-gradient-to-br from-green-300 to-green-400 border-green-500 hover:shadow-card transition-all duration-300">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-800 to-green-900 rounded-full">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-green-800 font-medium">Más Escalador</div>
              <div className="font-bold text-sm sm:text-base text-green-900">
                {monthStats.mostClimbed.name || 'Sin datos'}
              </div>
              <div className="text-xs text-green-700">
                +{monthStats.mostClimbed.positions} posiciones
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
