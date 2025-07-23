'use client'

import { useState, useEffect } from 'react'

export interface MonthlyStats {
  topWinner: { name: string; wins: number }
  topLoser: { name: string; losses: number }
  bestStreak: { name: string; streak: number }
  mostClimbed: { name: string; positions: number }
  mostChallengesSent: { name: string; challenges: number }
  bestAcceptanceRate: { name: string; rate: number }
  mostActivePlayer: { name: string; matches: number }
}

export function useMonthlyStats() {
  const [stats, setStats] = useState<MonthlyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Usar API routes en lugar de services directos
        const [usersWithStatsResponse, monthlyStatsResponse] = await Promise.all([
          fetch('/api/stats/user'), // Nuevo endpoint que devuelve todos los usuarios con sus stats
          fetch('/api/stats/monthly'),
        ])

        if (!usersWithStatsResponse.ok || !monthlyStatsResponse.ok) {
          throw new Error('Error fetching monthly stats')
        }

        const usersWithStatsData = await usersWithStatsResponse.json()
        const monthlyStatsData = await monthlyStatsResponse.json()

        const userChallengeStats = usersWithStatsData.userStats || []
        const monthStats = monthlyStatsData.stats || {}

        // Calcular estadísticas adicionales con valores por defecto
        interface UserWithStats {
          userId: string
          alias: string
          level: number
          challengeStats: {
            challengesSent?: number
            challengesReceived?: number
            acceptanceRate?: number
            challengesWon?: number
            challengesLost?: number
          }
        }

        const typedUserStats = userChallengeStats as UserWithStats[]

        const mostChallengesSent = typedUserStats.reduce((prev: UserWithStats, current: UserWithStats) =>
          (current.challengeStats.challengesSent || 0) > (prev.challengeStats.challengesSent || 0)
            ? current
            : prev
        )

        const bestAcceptanceRate = typedUserStats
          .filter((u: UserWithStats) => (u.challengeStats.challengesReceived || 0) > 0)
          .reduce((prev: UserWithStats, current: UserWithStats) =>
            (current.challengeStats.acceptanceRate || 0) > (prev.challengeStats.acceptanceRate || 0)
              ? current
              : prev
          )

        const mostActivePlayer = typedUserStats.reduce((prev: UserWithStats, current: UserWithStats) => {
          const prevMatches = (prev.challengeStats.challengesWon || 0) + (prev.challengeStats.challengesLost || 0)
          const currentMatches = (current.challengeStats.challengesWon || 0) + (current.challengeStats.challengesLost || 0)
          return currentMatches > prevMatches ? current : prev
        })

        setStats({
          topWinner: monthStats.topWinner || { name: '', wins: 0 },
          topLoser: monthStats.topLoser || { name: '', losses: 0 },
          bestStreak: monthStats.bestStreak || { name: '', streak: 0 },
          mostClimbed: {
            name: monthStats.mostClimbed?.alias || '',
            positions: monthStats.mostClimbed?.positions || 0,
          },
          mostChallengesSent: {
            name: mostChallengesSent.alias || '',
            challenges: mostChallengesSent.challengeStats.challengesSent || 0,
          },
          bestAcceptanceRate: {
            name: bestAcceptanceRate.alias || '',
            rate: Math.round(bestAcceptanceRate.challengeStats.acceptanceRate || 0),
          },
          mostActivePlayer: {
            name: mostActivePlayer.alias || '',
            matches: (mostActivePlayer.challengeStats.challengesWon || 0) + (mostActivePlayer.challengeStats.challengesLost || 0),
          },
        })
      } catch (err) {
        console.error('Error fetching monthly stats:', err)
        setError('Error al cargar estadísticas del mes')
        // Sin fallback mock - mostrar datos vacíos o de error
        setStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading, error, refetch: () => window.location.reload() }
}
