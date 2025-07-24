import { useState } from 'react'

export interface CreateIndividualMatchData {
  winnerId: string
  loserId: string
  challengeId?: string
  notes?: string
}

export interface PyramidChange {
  userId: string
  oldLevel: number
  newLevel: number
  reason: string
}

export interface CreateMatchResult {
  success: boolean
  match: {
    id: string
    winnerId: string | null
    loserId: string | null
    type: string
    challengeId: string | null
    createdAt: string
    completedAt: string | null
    notes: string | null
  } | null
  pyramidChanges: PyramidChange[]
  error?: string
}

export function useIndividualMatch() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createIndividualMatch = async (
    data: CreateIndividualMatchData
  ): Promise<CreateMatchResult> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/matches/individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error creating individual match:', err)
      return {
        success: false,
        match: null,
        pyramidChanges: [],
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createIndividualMatch,
    isLoading,
    error,
  }
}
