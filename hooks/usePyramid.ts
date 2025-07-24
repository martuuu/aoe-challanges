import { useState, useEffect } from 'react'

export interface PyramidUser {
  id: string
  name: string
  alias: string
  level: number
  elo: number
  wins: number
  losses: number
  streak: number
  winRate: number
  totalMatches: number
}

export interface PyramidData {
  1: PyramidUser[]
  2: PyramidUser[]
  3: PyramidUser[]
  4: PyramidUser[]
}

export function usePyramid() {
  const [pyramidData, setPyramidData] = useState<PyramidData>({
    1: [],
    2: [],
    3: [],
    4: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPyramidData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/pyramid')

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setPyramidData(data)
    } catch (err) {
      console.error('Error fetching pyramid data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPyramidData()
  }, [])

  return {
    pyramidData,
    isLoading,
    error,
    refetch: fetchPyramidData,
  }
}
