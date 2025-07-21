import { TrendingUp, TrendingDown, Zap, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsWidgetsProps {
  monthStats: {
    topWinner: { name: string; wins: number }
    topLoser: { name: string; losses: number }
    bestStreak: { name: string; streak: number }
    mostClimbed: { name: string; positions: number }
  }
}

export function StatsWidgets({ monthStats }: StatsWidgetsProps) {
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
                {monthStats.topWinner.name}
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
                {monthStats.topLoser.name}
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
                {monthStats.bestStreak.name}
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
                {monthStats.mostClimbed.name}
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
