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

export function useMonthlyStatsOptimized() {
  const [stats, setStats] = useState<MonthlyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Usar el endpoint optimizado que calcula en el backend
        const response = await fetch('/api/stats/monthly-optimized')
        if (!response.ok) {
          throw new Error('Error fetching monthly stats')
        }

        const data = await response.json()
        setStats(data.stats)
      } catch (err) {
        console.error('Error fetching monthly stats:', err)
        setError('Error al cargar estadísticas del mes')
        setStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return {
    stats,
    isLoading,
    error,
    refetch: () => window.location.reload(),
  }
}
