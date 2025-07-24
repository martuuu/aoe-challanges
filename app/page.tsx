'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { HeroSection } from '@/components/sections/HeroSection'
import { PyramidSection } from '@/components/sections/PyramidSection'
import { StatsWidgets } from '@/components/sections/StatsWidgets'
import { ActionButtons } from '@/components/sections/ActionButtons'
import { ChallengeSection } from '@/components/sections/ChallengeSection'
import { PlayableChallengesSection } from '@/components/sections/PlayableChallengesSection'
import { RecentMatches } from '@/components/sections/RecentMatches'
import { UserInfo } from '@/components/sections/UserInfo'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAuth } from '@/hooks/useAuth'
import { usePendingChallengesOptimized } from '@/hooks/usePendingChallengesOptimized'
import { useRecentHistoryOptimized } from '@/hooks/useRecentHistoryOptimized'
import { useAcceptedChallengesOptimized } from '@/hooks/useAcceptedChallengesOptimized'
import { clientUserService } from '@/lib/services/client-services'
import { initialUsers } from '@/lib/initial-users'
import { mockData } from '@/lib/mock-data'
import { usePyramid } from '@/hooks/usePyramid'
import { useCustomAlert } from '@/components/ui/custom-alert'
// Importar las contraseñas para desarrollo (mostrar en consola)
import '@/lib/dev-passwords'

export default function AOEPyramid() {
  const { user } = useAuth()
  const { showAlert, AlertContainer } = useCustomAlert()
  const { pyramidData, isLoading: pyramidLoading } = usePyramid()

  // Debug: Log del estado de pyramidLoading
  useEffect(() => {
    console.log('Pyramid loading state:', pyramidLoading)
  }, [pyramidLoading])

  // Estado para controlar la pantalla de carga
  const [isLoading, setIsLoading] = useState(true)
  const [showMainContent, setShowMainContent] = useState(false)

  // Hooks para datos reales - HABILITADOS ahora que Supabase funciona

  const { challenges: pendingChallengesFromHook, isLoading: pendingLoading } =
    usePendingChallengesOptimized(user?.id?.toString())
  const { recentMatches: recentMatchesFromHook, isLoading: recentLoading } =
    useRecentHistoryOptimized()
  const {
    acceptedChallenges,
    refetch: refetchAccepted,
    isLoading: acceptedLoading,
  } = useAcceptedChallengesOptimized()

  // Eliminar las variables fallback no utilizadas - usar mock solo en caso de error

  const [selectedChallenger, setSelectedChallenger] = useState('')
  const [selectedChallenged, setSelectedChallenged] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGroupMatchDialogOpen, setIsGroupMatchDialogOpen] = useState(false)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false)

  // Estados para datos reales
  const [allUsers, setAllUsers] = useState<{ id: string; alias: string; level: number }[]>([])
  // Estado de carga para operaciones async
  const [, setIsLoadingOperations] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  // Cargar usuarios al inicializar
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingOperations(true)
        setIsLoadingUsers(true)
        const users = await clientUserService.getAllUsers()
        setAllUsers(
          users.map((u: { id: string; alias: string; level: number }) => ({
            id: u.id,
            alias: u.alias,
            level: u.level,
          }))
        )
      } catch (error) {
        console.error('Error cargando usuarios:', error)
        // Fallback a usuarios iniciales si falla la DB
        setAllUsers(initialUsers.map(u => ({ id: u.id.toString(), alias: u.alias, level: 3 })))
      } finally {
        setIsLoadingOperations(false)
        setIsLoadingUsers(false)
      }
    }

    loadUsers()
  }, [])

  // Función para manejar cuando termine la carga
  const handleLoadingComplete = () => {
    setIsLoading(false)
    setShowMainContent(true)
  }

  // Convertir pyramidData a estructura legacy para compatibilidad
  const pyramid = {
    1: pyramidData[1]?.map(p => p.alias) || [],
    2: pyramidData[2]?.map(p => p.alias) || [],
    3: pyramidData[3]?.map(p => p.alias) || [],
    4: pyramidData[4]?.map(p => p.alias) || [],
  }

  const allPlayers = Object.values(pyramid).flat()

  // Usar datos reales con fallback a mock si no están disponibles
  const recentMatches = recentMatchesFromHook || mockData.recentMatches || []
  const pendingChallenges = pendingChallengesFromHook || mockData.pendingChallenges || []
  const realAcceptedChallenges = acceptedChallenges || mockData.acceptedChallenges || []
  const rejectedChallenges: never[] = [] // TODO: Implementar hook para desafíos rechazados
  const realRefetchAccepted =
    refetchAccepted || (() => console.log('Mock refetch accepted challenges'))

  // Funciones de utilidad
  const getAvailableOpponents = (player: string) => {
    const playerLevel = Object.entries(pyramid).find(([, players]) => players.includes(player))?.[0]

    if (!playerLevel) return []

    const currentLevel = Number.parseInt(playerLevel)
    const opponents: string[] = []

    if (currentLevel > 1) {
      const upperLevel = (currentLevel - 1) as keyof typeof pyramid
      opponents.push(...pyramid[upperLevel])
    }

    const sameLevel = currentLevel as keyof typeof pyramid
    opponents.push(...pyramid[sameLevel].filter(p => p !== player))

    return opponents
  }

  // Función para obtener oponentes disponibles para desafíos individuales (solo para user logueado)
  const getAvailableOpponentsForLoggedUser = () => {
    if (!user) return []

    const userLevel = Object.entries(pyramid).find(([, players]) =>
      players.includes(user.alias)
    )?.[0]

    if (!userLevel) return []

    const currentLevel = Number.parseInt(userLevel)
    const opponents: string[] = []

    // Puede desafiar al nivel superior
    if (currentLevel > 1) {
      const upperLevel = (currentLevel - 1) as keyof typeof pyramid
      opponents.push(...pyramid[upperLevel])
    }

    // Puede desafiar a jugadores del mismo nivel (excluyéndose a sí mismo)
    const sameLevel = currentLevel as keyof typeof pyramid
    opponents.push(...pyramid[sameLevel].filter(p => p !== user.alias))

    return opponents
  }

  // Función para obtener todos los jugadores excepto el usuario logueado (para sugerencias)
  const getPlayersForSuggestions = () => {
    if (!user) return allPlayers
    return allPlayers.filter(p => p !== user.alias)
  }

  const getHeadToHead = (player1: string, player2: string) => {
    const relevantMatches = recentMatches.filter(
      match =>
        match.type === 'challenge' &&
        match.winner &&
        match.loser &&
        ((match.winner.alias === player1 && match.loser.alias === player2) ||
          (match.winner.alias === player2 && match.loser.alias === player1))
    )

    const player1Wins = relevantMatches.filter(m => m.winner?.alias === player1).length
    const player2Wins = relevantMatches.filter(m => m.winner?.alias === player2).length

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

  const createChallenge = async () => {
    if (!user || !selectedChallenged) {
      showAlert('Debes estar logueado y seleccionar un oponente')
      return
    }

    try {
      setIsLoadingOperations(true)

      const challengedUser = allUsers.find(u => u.alias === selectedChallenged)

      if (!challengedUser) {
        console.error('Usuario desafiado no encontrado en allUsers')
        showAlert('Error: No se pudo encontrar el usuario seleccionado')
        return
      }

      // Llamar al API para crear el challenge
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengerId: user.id,
          challengedId: challengedUser.id,
          type: 'INDIVIDUAL',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error creando desafío')
      }

      // Mostrar mensaje de éxito antes de recargar
      showAlert('Desafío enviado')

      setIsDialogOpen(false)
      setSelectedChallenger('')
      setSelectedChallenged('')

      // Recargar página para actualizar datos
      window.location.reload()
    } catch (error) {
      console.error('Error creando desafío:', error)
      showAlert(
        `Error creando desafío: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    } finally {
      setIsLoadingOperations(false)
    }
  }

  const createSuggestion = async () => {
    if (!selectedChallenger || !selectedChallenged) {
      console.error('Validación fallida: selectedChallenger o selectedChallenged están vacíos')
      showAlert('Por favor selecciona ambos jugadores')
      return
    }

    try {
      setIsLoadingOperations(true)

      const challengerUser = allUsers.find(u => u.alias === selectedChallenger)
      const challengedUser = allUsers.find(u => u.alias === selectedChallenged)

      if (!challengerUser || !challengedUser) {
        console.error('Usuarios no encontrados en allUsers')
        showAlert('Error: No se pudieron encontrar los usuarios seleccionados')
        return
      }

      // Llamar al API para crear la sugerencia
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengerId: challengerUser.id,
          challengedId: challengedUser.id,
          type: 'SUGGESTION',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error creando sugerencia')
      }

      showAlert('Sugerencia creada')

      setIsSuggestDialogOpen(false)
      setSelectedChallenger('')
      setSelectedChallenged('')

      // Recargar página para actualizar datos
      window.location.reload()
    } catch (error) {
      console.error('Error creando sugerencia:', error)
      showAlert(
        `Error creando sugerencia: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    } finally {
      setIsLoadingOperations(false)
    }
  }

  const confirmChallenge = async (challengeId: string, action: 'accept' | 'reject') => {
    try {
      setIsLoadingOperations(true)

      if (!user?.id) {
        console.error('Usuario no autenticado')
        showAlert('Error: Usuario no autenticado')
        return
      }

      // Call the API to accept or reject the challenge
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          reason: action === 'reject' ? 'Rechazado por el usuario' : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Error ${action === 'accept' ? 'aceptando' : 'rechazando'} el desafío`
        )
      }

      const result = await response.json()
      console.log('Challenge updated:', result)

      showAlert(`Desafío ${action === 'accept' ? 'aceptado' : 'rechazado'}`)

      // Recargar datos después de procesar
      window.location.reload()
    } catch (error) {
      console.error('Error confirmando desafío:', error)
      showAlert(
        `Error confirmando desafío: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    } finally {
      setIsLoadingOperations(false)
    }
  }

  const confirmWinner = async (challengeId: string, winner: string) => {
    try {
      setIsLoadingOperations(true)

      const winnerUser = allUsers.find(u => u.alias === winner)

      if (!winnerUser) {
        console.error('Usuario ganador no encontrado:', winner)
        showAlert('Error: Usuario ganador no encontrado')
        return
      }

      // Call the API to complete the challenge
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete',
          winnerId: winnerUser.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error completando el desafío')
      }

      const result = await response.json()
      console.log('Challenge completed:', result)

      showAlert('Partido guardado')

      // Recargar datos después de confirmar
      realRefetchAccepted()
      window.location.reload()
    } catch (error) {
      console.error('Error confirmando ganador:', error)
      showAlert(
        `Error confirmando ganador: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    } finally {
      setIsLoadingOperations(false)
    }
  }

  const handleCreateGroupMatch = async (team1: string[], team2: string[]) => {
    if (!team1.length || !team2.length) {
      console.error('Validación fallida: equipos vacíos')
      showAlert('Ambos equipos deben tener al menos un jugador')
      return
    }

    try {
      setIsLoadingOperations(true)

      // Mostrar mensaje de éxito antes de recargar
      showAlert('Partida cargada')

      setIsGroupMatchDialogOpen(false)

      // Recargar página para actualizar datos
      window.location.reload()
    } catch (error) {
      console.error('Error creando partida grupal:', error)
      showAlert(
        `Error creando partida grupal: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      )
    } finally {
      setIsLoadingOperations(false)
    }
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen 
            key="loading" 
            onLoadingComplete={handleLoadingComplete}
            componentsLoading={{
              pyramid: pyramidLoading,
              pendingChallenges: pendingLoading || false,
              recentMatches: recentLoading || false,
              acceptedChallenges: acceptedLoading || false,
              users: isLoadingUsers,
            }}
          />
        )}
      </AnimatePresence>

      {showMainContent && (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
          <AlertContainer />
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
            {/* Información de usuario logueado */}
            <UserInfo />

            {/* Sección Hero */}
            <HeroSection />

            {/* Pirámide */}
            <PyramidSection
              isLoginDialogOpen={isLoginDialogOpen}
              setIsLoginDialogOpen={setIsLoginDialogOpen}
            />

            {/* Widgets de Estadísticas */}
            <StatsWidgets />

            {/* Botones de Acción */}
            <ActionButtons
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              isGroupMatchDialogOpen={isGroupMatchDialogOpen}
              setIsGroupMatchDialogOpen={setIsGroupMatchDialogOpen}
              isSuggestDialogOpen={isSuggestDialogOpen}
              setIsSuggestDialogOpen={setIsSuggestDialogOpen}
              selectedChallenger={selectedChallenger}
              setSelectedChallenger={setSelectedChallenger}
              selectedChallenged={selectedChallenged}
              setSelectedChallenged={setSelectedChallenged}
              allPlayers={user ? getPlayersForSuggestions() : allPlayers}
              getAvailableOpponents={
                user ? getAvailableOpponentsForLoggedUser : getAvailableOpponents
              }
              getHeadToHead={getHeadToHead}
              createChallenge={createChallenge}
              createSuggestion={createSuggestion}
              handleCreateGroupMatch={handleCreateGroupMatch}
            />

            {/* Desafíos Pendientes de Confirmación */}
            <ChallengeSection
              pendingChallenges={pendingChallenges}
              confirmChallenge={confirmChallenge}
              formatTimeRemaining={formatTimeRemaining}
              isLoading={pendingLoading || false}
            />

            {/* Desafíos Confirmados Listos para Jugar */}
            <PlayableChallengesSection
              acceptedChallenges={realAcceptedChallenges}
              confirmWinner={confirmWinner}
              formatTimeRemaining={formatTimeRemaining}
              isLoading={acceptedLoading || false}
            />

            {/* Partidas Recientes */}
            <RecentMatches
              recentMatches={recentMatches}
              cancelledChallenges={[]} // TODO: Implementar hook para desafíos cancelados
              rejectedChallenges={rejectedChallenges}
              formatTimeAgo={formatTimeAgo}
              isLoading={recentLoading || false}
            />
          </div>
        </div>
      )}
    </>
  )
}
