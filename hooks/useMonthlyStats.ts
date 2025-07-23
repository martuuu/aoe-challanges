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
        const [usersResponse, statsResponse] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/stats/monthly'),
        ])

        if (!usersResponse.ok || !statsResponse.ok) {
          throw new Error('Error fetching monthly stats')
        }

        const usersData = await usersResponse.json()
        const statsData = await statsResponse.json()

        const allUsers = usersData.users || []
        const monthStats = statsData.stats || {}

        // Interfaz temporal para datos de usuario de la API
        interface APIUser {
          id: string
          alias: string
          level?: number
        }

        // Obtener estadísticas de desafíos para cada usuario
        const userChallengeStats = await Promise.all(
          allUsers.map(async (user: APIUser) => {
            try {
              const challengeResponse = await fetch(`/api/stats/user/${user.id}`)
              const challengeData = challengeResponse.ok ? await challengeResponse.json() : {}
              return {
                ...user,
                challengeStats: challengeData.stats || {},
                totalMatches: challengeData.totalMatches || 0,
              }
            } catch {
              return {
                ...user,
                challengeStats: {},
                totalMatches: 0,
              }
            }
          })
        )

        // Calcular estadísticas adicionales con valores por defecto
        const mostChallengesSent = userChallengeStats.reduce((prev, current) =>
          (current.challengeStats.challengesSent || 0) > (prev.challengeStats.challengesSent || 0)
            ? current
            : prev
        )

        const bestAcceptanceRate = userChallengeStats
          .filter(u => (u.challengeStats.challengesReceived || 0) > 0)
          .reduce((prev, current) =>
            (current.challengeStats.acceptanceRate || 0) > (prev.challengeStats.acceptanceRate || 0)
              ? current
              : prev
          )

        const mostActivePlayer = userChallengeStats.reduce((prev, current) =>
          (current.totalMatches || 0) > (prev.totalMatches || 0) ? current : prev
        )

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
            matches: mostActivePlayer.totalMatches || 0,
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
