'use client'

import { useState, useEffect } from 'react'

export interface RecentChallenge {
  id: string
  challenger: string
  challenged: string
  status: 'pending' | 'accepted' | 'completed' | 'expired'
  created_at: string
  expires_at: string
  winner?: string
}

export interface RecentMatch {
  id: string
  winner: string
  loser: string
  created_at: string
  type: 'challenge' | 'group'
  team1?: string[]
  team2?: string[]
  winning_team?: 'team1' | 'team2'
}

export function useRecentHistory() {
  const [recentChallenges, setRecentChallenges] = useState<RecentChallenge[]>([])
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Usar API route en lugar de service directo
        const response = await fetch('/api/challenges?recent=10')
        if (!response.ok) {
          throw new Error('Error fetching recent challenges')
        }

        const data = await response.json()
        const challenges = data.challenges || []

        // Interfaz temporal para datos de la API
        interface APIChallenge {
          id: string
          challenger: { alias: string } | string
          challenged: { alias: string } | string
          status: string
          created_at?: string
          createdAt?: string
          expires_at?: string
          expiresAt?: string
          winner?: string
        }

        const formattedChallenges: RecentChallenge[] = challenges.map(
          (challenge: APIChallenge) => ({
            id: challenge.id,
            challenger:
              typeof challenge.challenger === 'string'
                ? challenge.challenger
                : challenge.challenger.alias,
            challenged:
              typeof challenge.challenged === 'string'
                ? challenge.challenged
                : challenge.challenged.alias,
            status: challenge.status.toLowerCase() as
              | 'pending'
              | 'accepted'
              | 'completed'
              | 'expired',
            created_at: challenge.created_at || challenge.createdAt || '',
            expires_at: challenge.expires_at || challenge.expiresAt || '',
            winner: challenge.winner,
          })
        )

        setRecentChallenges(formattedChallenges)

        // Por ahora no hay matches reales, usar array vacío
        setRecentMatches([])
      } catch (err) {
        console.error('Error fetching recent history:', err)
        setError('Error al cargar historial')
        // Sin fallback mock, mostrar datos vacíos
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
