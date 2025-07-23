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
          <Card key={i} className="bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gray-300 rounded-full">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded"></div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Sin datos</div>
                  <div className="font-bold text-sm sm:text-base text-gray-600">-</div>
                  <div className="text-xs text-gray-400">No disponible</div>
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
      <Card className="bg-gradient-to-br from-green-50 to-green-100 hover:shadow-card transition-all duration-300">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-600 to-green-700 rounded-full">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-green-600 font-medium">Más Ganador</div>
              <div className="font-bold text-sm sm:text-base text-green-700">
                {monthStats.topWinner.name || 'Sin datos'}
              </div>
              <div className="text-xs text-green-800">{monthStats.topWinner.wins} victorias</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-card transition-all duration-300">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#F79B72] to-[#F5865A] rounded-full">
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-orange-600 font-medium">Más Perdedor</div>
              <div className="font-bold text-sm sm:text-base text-orange-700">
                {monthStats.topLoser.name || 'Sin datos'}
              </div>
              <div className="text-xs text-orange-500">{monthStats.topLoser.losses} derrotas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-card transition-all duration-300">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-amber-500 font-medium">Mayor Racha</div>
              <div className="font-bold text-sm sm:text-base text-amber-500">
                {monthStats.bestStreak.name || 'Sin datos'}
              </div>
              <div className="text-xs text-amber-700">{monthStats.bestStreak.streak} seguidas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-card transition-all duration-300">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-blue-600 font-medium">Más Escalador</div>
              <div className="font-bold text-sm sm:text-base text-blue-700">
                {monthStats.mostClimbed.name || 'Sin datos'}
              </div>
              <div className="text-xs text-blue-600">
                +{monthStats.mostClimbed.positions} posiciones
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
