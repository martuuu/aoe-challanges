import { useState, useCallback } from 'react'
import { PyramidUser } from './usePyramid'

export interface HeadToHeadStats {
  totalMatches: number
  player1Wins: number
  player2Wins: number
  recentMatches: Array<{
    id: string
    winnerId: string | null
    loserId: string | null
    createdAt: string
  }>
}

export function usePyramidActions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener oponentes disponibles para un usuario
  const getAvailableOpponents = useCallback(async (userId: string): Promise<PyramidUser[]> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/pyramid/opponents/${userId}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching available opponents:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Validar si un desafío es permitido
  const validateChallenge = useCallback(
    async (
      challengerId: string,
      challengedId: string
    ): Promise<{ canChallenge: boolean; reason?: string }> => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/pyramid/validate-challenge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ challengerId, challengedId }),
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        return await response.json()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        console.error('Error validating challenge:', err)
        return { canChallenge: false, reason: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Obtener estadísticas head-to-head entre dos jugadores
  const getHeadToHeadStats = useCallback(
    async (player1Id: string, player2Id: string): Promise<HeadToHeadStats | null> => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/pyramid/head-to-head/${player1Id}/${player2Id}`)

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        return await response.json()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        console.error('Error fetching head-to-head stats:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    getAvailableOpponents,
    validateChallenge,
    getHeadToHeadStats,
    isLoading,
    error,
  }
}
