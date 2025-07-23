'use client'

import { useState, useEffect, useCallback } from 'react'

export interface AcceptedChallenge {
  id: string
  challenger: { alias: string }
  challenged: { alias: string }
  createdAt: Date
  expiresAt: Date
  status: string
}

export function useAcceptedChallenges() {
  const [challenges, setChallenges] = useState<AcceptedChallenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChallenges = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Usar API route en lugar de service directo
      const response = await fetch('/api/challenges/?status=accepted')
      if (!response.ok) {
        throw new Error('Error fetching accepted challenges')
      }

      const data = await response.json()
      const acceptedChallenges = data.challenges || []

      // Interfaz temporal para datos de la API
      interface APIChallengeData {
        id: string
        challenger?: { alias: string } | string
        challenged?: { alias: string } | string
        created_at?: string
        createdAt?: string
        expires_at?: string
        expiresAt?: string
        status: string
      }

      // Formatear datos para el componente
      const formattedChallenges: AcceptedChallenge[] = acceptedChallenges.map(
        (challenge: APIChallengeData) => ({
          id: challenge.id,
          challenger: {
            alias:
              typeof challenge.challenger === 'string'
                ? challenge.challenger
                : challenge.challenger?.alias || '',
          },
          challenged: {
            alias:
              typeof challenge.challenged === 'string'
                ? challenge.challenged
                : challenge.challenged?.alias || '',
          },
          createdAt: new Date(challenge.created_at || challenge.createdAt || Date.now()),
          expiresAt: new Date(challenge.expires_at || challenge.expiresAt || Date.now()),
          status: challenge.status,
        })
      )

      setChallenges(formattedChallenges)
    } catch (err) {
      console.error('Error fetching accepted challenges:', err)
      setError('Error al cargar desafíos aceptados')
      setChallenges([]) // Sin fallback mock
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  return { challenges, isLoading, error, refetch: fetchChallenges }
}
