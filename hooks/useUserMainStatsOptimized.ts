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

export function useUserMainStatsOptimized(userId?: string) {
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

        // Usar el endpoint optimizado específico del usuario
        const response = await fetch(`/api/stats/user/${userId}`)
        if (!response.ok) {
          throw new Error('Error fetching user stats')
        }

        const data = await response.json()
        setStats(data.stats)
      } catch (err) {
        console.error('Error fetching user stats:', err)
        setError('Error al cargar estadísticas del usuario')
        setStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  return {
    stats,
    isLoading,
    error,
    refetch: () => window.location.reload(),
  }
}
