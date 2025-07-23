'use client'

import { useState, useEffect, useCallback } from 'react'

export interface PendingChallenge {
  id: string
  challenger: string
  challenged: string
  status: string
  created_at: string
  expires_at: string
  type?: string
  challenger_confirmed?: boolean
  challenged_confirmed?: boolean
}

export function usePendingChallenges(userId?: string) {
  const [challenges, setChallenges] = useState<PendingChallenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChallenges = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // Usar API route en lugar de service directo
      const response = await fetch('/api/challenges')
      if (!response.ok) {
        throw new Error('Error fetching challenges')
      }

      const data = await response.json()
      const allChallenges = data.challenges || []

      // Filtrar por usuario en el cliente
      const userChallenges = allChallenges
        .filter((challenge: PendingChallenge) => challenge.challenged === userId)
        .map((challenge: PendingChallenge) => ({
          id: challenge.id,
          challenger: challenge.challenger,
          challenged: challenge.challenged,
          status: challenge.status,
          created_at: challenge.created_at,
          expires_at: challenge.expires_at,
          type: challenge.type,
        }))

      setChallenges(userChallenges)
      setError(null)
    } catch (err) {
      console.error('Error fetching challenges:', err)
      setError('Error al cargar desafíos pendientes')
      setChallenges([])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const acceptChallenge = async (challengeId: string, winnerId: string) => {
    try {
      // Usar API route para completar desafío
      const response = await fetch(`/api/challenges/${challengeId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winnerId }),
      })

      if (!response.ok) {
        throw new Error('Error completing challenge')
      }

      // Recargar desafíos después de completar uno
      await fetchChallenges()
    } catch (err) {
      console.error('Error accepting challenge:', err)
      setError('Error al procesar el resultado del desafío')
    }
  }

  return {
    challenges,
    isLoading,
    error,
    acceptChallenge,
    refetch: fetchChallenges,
  }
}
