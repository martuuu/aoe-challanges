'use client'

import { useState, useEffect } from 'react'

interface AcceptedChallenge {
  id: string
  created_at: string
  expires_at: string
  challenger: string // alias
  challenged: string // alias
  type?: string
  status: 'accepted' | 'pending' | 'completed' | 'expired' | 'rejected' | 'cancelled'
}

export function useAcceptedChallengesOptimized() {
  const [acceptedChallenges, setAcceptedChallenges] = useState<AcceptedChallenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAcceptedChallenges = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/challenges-optimized?status=accepted')

        if (!response.ok) {
          throw new Error('Error fetching accepted challenges')
        }

        const data = await response.json()
        setAcceptedChallenges(data.challenges || [])
      } catch (err) {
        console.error('Error fetching accepted challenges:', err)
        setError('Error al cargar desafíos aceptados')
        setAcceptedChallenges([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAcceptedChallenges()
  }, [])

  return {
    acceptedChallenges,
    isLoading,
    error,
    refetch: () => window.location.reload(),
  }
}
