'use client'

import { useState, useEffect } from 'react'
import { HeroSection } from '@/components/sections/HeroSection'
import { PyramidSection } from '@/components/sections/PyramidSection'
import { StatsWidgets } from '@/components/sections/StatsWidgets'
import { ActionButtons } from '@/components/sections/ActionButtons'
import { ChallengesSection } from '@/components/sections/ChallengesSection'
import { HistorySection } from '@/components/sections/HistorySection'

// Jugadores distribuidos aleatoriamente en la pirámide
const initialPyramid = {
  1: ['Chino'], // Rey de la pirámide
  2: ['Ruso', 'Mosca'], // Segundo escalón
  3: ['Tincho', 'Pana', 'Chaquinha'], // Tercer escalón
  4: ['Dany', 'Bicho', 'Seba', 'Tata', 'Mati'], // Base de la pirámide
}

interface Challenge {
  id: string
  challenger: string
  challenged: string
  status: 'pending' | 'accepted' | 'completed' | 'expired'
  created_at: string
  expires_at: string
  winner?: string
}

interface Match {
  id: string
  winner: string
  loser: string
  created_at: string
  type: 'challenge' | 'group'
  team1?: string[]
  team2?: string[]
  winning_team?: 'team1' | 'team2'
}

export default function AOEPyramid() {
  const [pyramid, setPyramid] = useState(initialPyramid)
  const [selectedChallenger, setSelectedChallenger] = useState('')
  const [selectedChallenged, setSelectedChallenged] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGroupMatchDialogOpen, setIsGroupMatchDialogOpen] = useState(false)

  // Datos simulados para los desafíos
  const [recentChallenges] = useState<Challenge[]>([
    {
      id: '1',
      challenger: 'Dany',
      challenged: 'Pana',
      status: 'pending',
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      challenger: 'Bicho',
      challenged: 'Tincho',
      status: 'completed',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      winner: 'Bicho',
    },
  ])

  // Datos simulados para las partidas
  const [recentMatches] = useState<Match[]>([
    {
      id: '1',
      winner: 'Chino',
      loser: 'Ruso',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      type: 'challenge',
    },
    {
      id: '2',
      winner: '',
      loser: '',
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      type: 'group',
      team1: ['Tincho', 'Pana'],
      team2: ['Dany', 'Bicho'],
      winning_team: 'team1',
    },
  ])

  const allPlayers = Object.values(pyramid).flat()

  // Estadísticas del mes
  const monthStats = {
    topWinner: { name: 'Chino', wins: 8 },
    topLoser: { name: 'Mati', losses: 6 },
    bestStreak: { name: 'Ruso', streak: 4 },
    mostClimbed: { name: 'Tincho', positions: 2 },
  }

  // Desafíos pendientes
  const pendingChallenges = recentChallenges.filter(challenge => challenge.status === 'pending')

  // Funciones de utilidad
  const getAvailableOpponents = (player: string) => {
    const playerLevel = Object.keys(pyramid).find(level =>
      pyramid[level as keyof typeof pyramid].includes(player)
    )
    if (!playerLevel) return []

    const currentLevel = Number.parseInt(playerLevel)
    const opponents = []

    if (currentLevel > 1) {
      opponents.push(...pyramid[(currentLevel - 1) as keyof typeof pyramid])
    }
    opponents.push(...pyramid[currentLevel as keyof typeof pyramid].filter(p => p !== player))

    return opponents
  }

  const getHeadToHead = (player1: string, player2: string) => {
    const relevantMatches = recentMatches.filter(
      match =>
        match.type === 'challenge' &&
        ((match.winner === player1 && match.loser === player2) ||
          (match.winner === player2 && match.loser === player1))
    )

    const player1Wins = relevantMatches.filter(m => m.winner === player1).length
    const player2Wins = relevantMatches.filter(m => m.winner === player2).length

    return `${player1Wins}-${player2Wins}`
  }

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
    return 'hace poco'
  }

  const formatTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Expirado'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  const createChallenge = () => {
    console.log(`Desafío creado: ${selectedChallenger} vs ${selectedChallenged}`)
    setIsDialogOpen(false)
    setSelectedChallenger('')
    setSelectedChallenged('')
  }

  const acceptChallenge = (challengeId: string, winner: string) => {
    console.log(`Desafío ${challengeId} completado. Ganador: ${winner}`)
  }

  const handleCreateGroupMatch = (team1: string[], team2: string[], winner: 'team1' | 'team2') => {
    console.log(
      `Partida grupal creada: ${team1.join(', ')} vs ${team2.join(', ')}. Ganador: ${winner}`
    )
    setIsGroupMatchDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23456882' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-8 relative z-10">
        {/* Sección Hero */}
        <HeroSection />

        {/* Pirámide */}
        <PyramidSection pyramid={pyramid} />

        {/* Widgets de Estadísticas */}
        <StatsWidgets monthStats={monthStats} />

        {/* Botones de Acción */}
        <ActionButtons
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          isGroupMatchDialogOpen={isGroupMatchDialogOpen}
          setIsGroupMatchDialogOpen={setIsGroupMatchDialogOpen}
          selectedChallenger={selectedChallenger}
          setSelectedChallenger={setSelectedChallenger}
          selectedChallenged={selectedChallenged}
          setSelectedChallenged={setSelectedChallenged}
          allPlayers={allPlayers}
          getAvailableOpponents={getAvailableOpponents}
          getHeadToHead={getHeadToHead}
          createChallenge={createChallenge}
          handleCreateGroupMatch={handleCreateGroupMatch}
        />

        {/* Desafíos Pendientes */}
        {pendingChallenges.length > 0 && (
          <ChallengesSection
            pendingChallenges={pendingChallenges}
            acceptChallenge={acceptChallenge}
            formatTimeRemaining={formatTimeRemaining}
          />
        )}

        {/* Historial */}
        <HistorySection
          recentChallenges={recentChallenges}
          recentMatches={recentMatches}
          formatTimeAgo={formatTimeAgo}
        />
      </div>
    </div>
  )
}
