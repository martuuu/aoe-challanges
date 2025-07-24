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
  challengerStatus?: 'pending' | 'accepted' | 'rejected'
  challengedStatus?: 'pending' | 'accepted' | 'rejected'
}

export function usePendingChallengesOptimized(userId?: string) {
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
      setError(null)
      // Usar endpoint optimizado con filtros específicos
      const response = await fetch(`/api/challenges-optimized?status=pending&userId=${userId}`)
      if (!response.ok) {
        throw new Error('Error fetching challenges')
      }

      const data = await response.json()

      // El API ya filtra por userId, no necesitamos filtrar nuevamente aquí
      // Los challenges devueltos ya son específicos para este usuario
      setChallenges(data.challenges)
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

      await fetchChallenges()
    } catch (err) {
      console.error('Error accepting challenge:', err)
      throw new Error('Error al procesar el resultado del desafío')
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
