'use client'

import { useState, useEffect } from 'react'
import { HeroSection } from '@/components/sections/HeroSection'
import { PyramidSection } from '@/components/sections/PyramidSection'
import { StatsWidgets } from '@/components/sections/StatsWidgets'
import { ActionButtons } from '@/components/sections/ActionButtons'
import { ChallengesSection } from '@/components/sections/ChallengesSection'
import { HistorySection } from '@/components/sections/HistorySection'
import { UserInfo } from '@/components/UserInfo'
import { useAuth } from '@/hooks/useAuth'
import { useMonthlyStats } from '@/hooks/useMonthlyStats'
import { usePendingChallenges } from '@/hooks/usePendingChallenges'
import { useRecentHistory } from '@/hooks/useRecentHistory'
import { useAcceptedChallenges } from '@/hooks/useAcceptedChallenges'
import {
  clientChallengeService,
  clientMatchService,
  clientUserService,
} from '@/lib/services/client-services'
import { initialUsers } from '@/lib/initial-users'
import { mockData } from '@/lib/mock-data'
// Importar las contraseñas para desarrollo (mostrar en consola)
import '@/lib/dev-passwords'

// Actualizar pirámide con los nuevos usuarios (todos empiezan en nivel 3)
const initialPyramid = {
  1: [] as string[], // Nadie al principio
  2: [] as string[], // Nadie al principio
  3: initialUsers.map(user => user.alias), // Todos empiezan aquí
  4: [] as string[], // Nadie al principio
}

export default function AOEPyramid() {
  const { user } = useAuth()

  // Hooks para datos reales - HABILITADOS ahora que Supabase funciona
  const { stats: monthlyStats } = useMonthlyStats()
  const { challenges: pendingChallengesFromHook } = usePendingChallenges(user?.id?.toString())
  const { recentChallenges: recentChallengesFromHook, recentMatches: recentMatchesFromHook } =
    useRecentHistory()
  const { challenges: acceptedChallenges, refetch: refetchAccepted } = useAcceptedChallenges()

  // Eliminar las variables fallback no utilizadas - usar mock solo en caso de error

  const [pyramid, setPyramid] = useState(initialPyramid)
  const [selectedChallenger, setSelectedChallenger] = useState('')
  const [selectedChallenged, setSelectedChallenged] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGroupMatchDialogOpen, setIsGroupMatchDialogOpen] = useState(false)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false)

  // Estados para datos reales
  const [allUsers, setAllUsers] = useState<{ id: string; alias: string; level: number }[]>([])
  // Estado de carga para operaciones async
  const [, setIsLoading] = useState(false)

  // Cargar usuarios al inicializar
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
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
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  const allPlayers = Object.values(pyramid).flat()

  // Usar datos reales con fallback a mock si no están disponibles
  const recentChallenges = recentChallengesFromHook || mockData.recentChallenges || []
  const recentMatches = recentMatchesFromHook || mockData.recentMatches || []
  const pendingChallenges = pendingChallengesFromHook || mockData.pendingChallenges || []
  const monthStats = monthlyStats || mockData.monthStats || null
  const realAcceptedChallenges = acceptedChallenges || mockData.acceptedChallenges || []
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

  const createChallenge = async () => {
    console.log('createChallenge llamada - Debug Info:', {
      user,
      selectedChallenged,
      userValidation: !user || !selectedChallenged,
      allUsers: allUsers.length
    })

    if (!user || !selectedChallenged) {
      console.error('Validación fallida: user o selectedChallenged están vacíos')
      alert('Debes estar logueado y seleccionar un oponente')
      return
    }

    try {
      setIsLoading(true)
      console.log('Buscando usuario desafiado...')
      
      const challengedUser = allUsers.find(u => u.alias === selectedChallenged)
      
      console.log('Usuario desafiado encontrado:', challengedUser)

      if (!challengedUser) {
        console.error('Usuario desafiado no encontrado en allUsers')
        alert('Error: No se pudo encontrar el usuario seleccionado')
        return
      }

      console.log('Enviando petición a la API...')
      const result = await clientChallengeService.createChallenge({
        challengerId: user.id.toString(),
        challengedId: challengedUser.id,
        type: 'INDIVIDUAL',
      })

      console.log('Respuesta de la API:', result)
      console.log(`Desafío individual creado: ${user.alias} vs ${selectedChallenged}`)
      
      // Mostrar mensaje de éxito antes de recargar
      alert(`¡Desafío creado exitosamente! ${user.alias} vs ${selectedChallenged}`)
      
      setIsDialogOpen(false)
      setSelectedChallenger('')
      setSelectedChallenged('')

      // Recargar página para actualizar datos
      window.location.reload()
    } catch (error) {
      console.error('Error creando desafío:', error)
      alert(`Error creando desafío: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const createSuggestion = async () => {
    console.log('createSuggestion llamada - Debug Info:', {
      selectedChallenger,
      selectedChallenged,
      allUsers: allUsers.length,
      firstValidation: !selectedChallenger || !selectedChallenged
    })

    if (!selectedChallenger || !selectedChallenged) {
      console.error('Validación fallida: selectedChallenger o selectedChallenged están vacíos')
      alert('Por favor selecciona ambos jugadores')
      return
    }

    try {
      setIsLoading(true)
      console.log('Buscando usuarios en allUsers...')
      
      const challengerUser = allUsers.find(u => u.alias === selectedChallenger)
      const challengedUser = allUsers.find(u => u.alias === selectedChallenged)

      console.log('Usuarios encontrados:', { challengerUser, challengedUser })

      if (!challengerUser || !challengedUser) {
        console.error('Usuarios no encontrados en allUsers')
        alert('Error: No se pudieron encontrar los usuarios seleccionados')
        return
      }

      console.log('Enviando petición a la API...')
      const result = await clientChallengeService.createChallenge({
        challengerId: challengerUser.id,
        challengedId: challengedUser.id,
        type: 'SUGGESTION',
      })

      console.log('Respuesta de la API:', result)
      console.log(`Sugerencia de desafío creada: ${selectedChallenger} vs ${selectedChallenged}`)
      
      // Mostrar mensaje de éxito antes de recargar
      alert(`¡Sugerencia creada exitosamente! ${selectedChallenger} vs ${selectedChallenged}`)
      
      setIsSuggestDialogOpen(false)
      setSelectedChallenger('')
      setSelectedChallenged('')

      // Recargar página para actualizar datos
      window.location.reload()
    } catch (error) {
      console.error('Error creando sugerencia:', error)
      alert(`Error creando sugerencia: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const acceptChallenge = async (challengeId: string, action: string) => {
    console.log('acceptChallenge llamada - Debug Info:', {
      challengeId,
      action,
      allUsers: allUsers.length
    })

    try {
      setIsLoading(true)

      if (action === 'accept') {
        // Aceptar desafío - pasa a "accepted" status
        console.log('Aceptando desafío...')
        const result = await clientChallengeService.acceptChallenge(challengeId)
        console.log('Respuesta API accept:', result)
        console.log(`Desafío ${challengeId} aceptado`)
        alert(`¡Desafío aceptado exitosamente!`)
      } else if (action === 'reject') {
        // Rechazar desafío
        console.log('Rechazando desafío...')
        const result = await clientChallengeService.rejectChallenge(challengeId, 'Rechazado por el usuario')
        console.log('Respuesta API reject:', result)
        console.log(`Desafío ${challengeId} rechazado`)
        alert(`Desafío rechazado`)
      } else if (action === 'both') {
        // Para sugerencias, ambos aceptan el desafío
        console.log('Aceptando sugerencia por ambos jugadores...')
        const result = await clientChallengeService.acceptChallenge(challengeId)
        console.log('Respuesta API both:', result)
        console.log(`Sugerencia aceptada por ambos jugadores: ${challengeId}`)
        alert(`¡Sugerencia aceptada por ambos jugadores!`)
      } else {
        // Es un alias de jugador - completar desafío con ganador
        console.log('Completando desafío con ganador...')
        const winnerUser = allUsers.find(u => u.alias === action)
        if (!winnerUser) {
          console.error('Usuario ganador no encontrado:', action)
          alert('Error: Usuario ganador no encontrado')
          return
        }

        const result = await clientChallengeService.completeChallenge(challengeId, winnerUser.id)
        console.log('Respuesta API complete:', result)
        console.log(`Desafío ${challengeId} completado. Ganador: ${action}`)
        alert(`¡Desafío completado! Ganador: ${action}`)
      }

      // Recargar datos después de procesar
      window.location.reload()
    } catch (error) {
      console.error('Error procesando desafío:', error)
      alert(`Error procesando desafío: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmWinner = async (challengeId: string, winner: string) => {
    console.log('confirmWinner llamada - Debug Info:', {
      challengeId,
      winner,
      allUsers: allUsers.length
    })

    try {
      setIsLoading(true)

      console.log('Buscando usuario ganador...')
      const winnerUser = allUsers.find(u => u.alias === winner)
      
      if (!winnerUser) {
        console.error('Usuario ganador no encontrado:', winner)
        alert('Error: Usuario ganador no encontrado')
        return
      }

      console.log('Usuario ganador encontrado:', winnerUser)
      console.log('Enviando petición para completar desafío...')
      
      const result = await clientChallengeService.completeChallenge(challengeId, winnerUser.id)
      
      console.log('Respuesta API confirmWinner:', result)
      console.log(`Ganador confirmado para desafío ${challengeId}: ${winner}`)
      
      alert(`¡Ganador confirmado exitosamente! ${winner}`)

      // Recargar datos después de confirmar
      realRefetchAccepted()
      window.location.reload()
    } catch (error) {
      console.error('Error confirmando ganador:', error)
      alert(`Error confirmando ganador: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGroupMatch = async (
    team1: string[],
    team2: string[],
    winner: 'team1' | 'team2'
  ) => {
    console.log('handleCreateGroupMatch llamada - Debug Info:', {
      team1,
      team2,
      winner,
      validTeams: team1.length > 0 && team2.length > 0
    })

    if (!team1.length || !team2.length) {
      console.error('Validación fallida: equipos vacíos')
      alert('Ambos equipos deben tener al menos un jugador')
      return
    }

    try {
      setIsLoading(true)
      console.log('Enviando petición a la API...')

      const result = await clientMatchService.createGroupMatch({
        team1,
        team2,
        winner,
      })

      console.log('Respuesta de la API:', result)
      console.log(
        `Partida grupal creada: ${team1.join(', ')} vs ${team2.join(', ')}. Ganador: ${winner}`
      )

      // Mostrar mensaje de éxito antes de recargar
      alert(`¡Partida grupal creada exitosamente!\n${team1.join(', ')} vs ${team2.join(', ')}\nGanador: Equipo ${winner === 'team1' ? '1' : '2'}`)

      setIsGroupMatchDialogOpen(false)

      // Recargar página para actualizar datos
      window.location.reload()
    } catch (error) {
      console.error('Error creando partida grupal:', error)
      alert(`Error creando partida grupal: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
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
        {/* Información de usuario logueado */}
        <UserInfo />

        {/* Sección Hero */}
        <HeroSection />

        {/* Pirámide */}
        <PyramidSection
          pyramid={pyramid}
          setPyramid={setPyramid}
          isLoginDialogOpen={isLoginDialogOpen}
          setIsLoginDialogOpen={setIsLoginDialogOpen}
        />

        {/* Widgets de Estadísticas */}
        {monthStats && <StatsWidgets monthStats={monthStats} />}

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
          getAvailableOpponents={user ? getAvailableOpponentsForLoggedUser : getAvailableOpponents}
          getHeadToHead={getHeadToHead}
          createChallenge={createChallenge}
          createSuggestion={createSuggestion}
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
          acceptedChallenges={realAcceptedChallenges}
          confirmWinner={confirmWinner}
          formatTimeAgo={formatTimeAgo}
        />
      </div>
    </div>
  )
}
