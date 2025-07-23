'use client'

import { useState, useEffect } from 'react'

export interface UserMainStats {
  currentPosition: number
  totalPlayers: number
  winRate: number
  totalMatches: number
  currentStreak: number
  recentForm: ('W' | 'L')[]
  level: number
  levelDays: number
  nextPromotionElo?: number
  promotions: number
  demotions: number
  monthlyMatches: number
  activeChallenges: number
  pendingChallenges: number
}

export function useUserMainStats(userId?: string) {
  const [stats, setStats] = useState<UserMainStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Usar API routes en lugar de services directos
        const [userStatsResponse, rankingResponse, challengesResponse] = await Promise.all([
          fetch(`/api/users/${userId}/stats`),
          fetch(`/api/users/${userId}/ranking`),
          fetch(`/api/challenges?userId=${userId}`),
        ])

        if (!userStatsResponse.ok || !rankingResponse.ok || !challengesResponse.ok) {
          throw new Error('Error fetching user stats')
        }

        const userStatsData = await userStatsResponse.json()
        const rankingData = await rankingResponse.json()
        const challengesData = await challengesResponse.json()

        const userStats = userStatsData.stats || {}
        const userRanking = rankingData.ranking || {}
        const challenges = challengesData.challenges || []

        // Interfaz para los desafíos de la API
        interface APIChallenge {
          id: string
          status: string
        }

        // Separar desafíos activos y pendientes
        const activeChallenges = challenges.filter((c: APIChallenge) => c.status === 'accepted')
        const pendingChallenges = challenges.filter((c: APIChallenge) => c.status === 'pending')

        // Obtener estadísticas de challenge por separado para evitar errores
        try {
          const challengeStatsResponse = await fetch(`/api/stats/user/${userId}`)
          if (challengeStatsResponse.ok) {
            await challengeStatsResponse.json()
            // Stats disponibles si necesarios en el futuro
          }
        } catch {
          // Ignorar errores de challenge stats
        }

        // Obtener forma reciente manualmente por ahora
        const recentForm: ('W' | 'L')[] = ['W', 'W', 'L', 'W', 'W'] // Mock por ahora

        // Obtener total de usuarios
        let totalPlayers = 0
        try {
          const totalUsersResponse = await fetch('/api/users/count')
          if (totalUsersResponse.ok) {
            const totalUsersData = await totalUsersResponse.json()
            totalPlayers = totalUsersData.count || 0
          }
        } catch {
          // Usar valor por defecto
        }

        const mainStats: UserMainStats = {
          currentPosition: userRanking.position || 0,
          totalPlayers,
          winRate:
            (userStats.totalMatches || 0) > 0
              ? ((userStats.wins || 0) / (userStats.totalMatches || 0)) * 100
              : 0,
          totalMatches: userStats.totalMatches || 0,
          currentStreak: userStats.currentStreak || 0,
          recentForm,
          level: userStats.level || 1,
          levelDays: userStats.levelDays || 0,
          nextPromotionElo: userStats.nextPromotionElo,
          promotions: userStats.promotions || 0,
          demotions: userStats.demotions || 0,
          monthlyMatches: userStats.monthlyMatches || 0, // Mock por ahora
          activeChallenges: activeChallenges.length,
          pendingChallenges: pendingChallenges.length,
        }

        setStats(mainStats)
      } catch (err) {
        console.error('Error fetching user main stats:', err)
        setError('Error al cargar estadísticas')
        // Sin fallback mock
        setStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  return { stats, isLoading, error, refetch: () => window.location.reload() }
}
