'use client'

import { useState, useEffect } from 'react'

export interface RecentChallenge {
  id: string
  challenger: string
  challenged: string
  status: 'pending' | 'accepted' | 'completed' | 'expired' | 'rejected' | 'cancelled'
  created_at: string
  expires_at: string
  winner?: string
  type?: string
  challengerStatus?: 'pending' | 'accepted' | 'rejected'
  challengedStatus?: 'pending' | 'accepted' | 'rejected'
}

export interface RecentMatch {
  id: string
  winner?: {
    id: string
    name: string
    alias: string
    level: number
  } | null
  loser?: {
    id: string
    name: string
    alias: string
    level: number
  } | null
  completedAt: string
  type: 'challenge' | 'group'
  team1?: string[]
  team2?: string[]
  winning_team?: 'team1' | 'team2'
}

export function useRecentHistoryOptimized() {
  const [recentChallenges, setRecentChallenges] = useState<RecentChallenge[]>([])
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Usar endpoints optimizados en paralelo
        const [challengesResponse, matchesResponse] = await Promise.all([
          fetch('/api/challenges-optimized?recent=10'),
          fetch('/api/matches?recent=10'),
        ])

        if (!challengesResponse.ok || !matchesResponse.ok) {
          throw new Error('Error fetching recent history')
        }

        const [challengesData, matchesData] = await Promise.all([
          challengesResponse.json(),
          matchesResponse.json(),
        ])

        setRecentChallenges(challengesData.challenges || [])
        setRecentMatches(matchesData.matches || [])
      } catch (err) {
        console.error('Error fetching recent history:', err)
        setError('Error al cargar historial')
        setRecentChallenges([])
        setRecentMatches([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return {
    recentChallenges,
    recentMatches,
    isLoading,
    error,
    refetch: () => window.location.reload(),
  }
}
