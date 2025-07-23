'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { X, Users } from 'lucide-react'

interface DragDropGroupMatchProps {
  allPlayers: string[]
  onCreateMatch: (team1: string[], team2: string[], winner: 'team1' | 'team2') => void
}

export function DragDropGroupMatch({ allPlayers, onCreateMatch }: DragDropGroupMatchProps) {
  const [team1, setTeam1] = useState<string[]>([])
  const [team2, setTeam2] = useState<string[]>([])
  const [winner, setWinner] = useState<'team1' | 'team2' | null>(null)
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null)

  const availablePlayers = allPlayers.filter(
    player => !team1.includes(player) && !team2.includes(player)
  )

  const addToTeam = (player: string, team: 'team1' | 'team2') => {
    // Remover del otro equipo si está ahí
    if (team === 'team1') {
      setTeam2(team2.filter(p => p !== player))
      if (!team1.includes(player)) {
        setTeam1([...team1, player])
      }
    } else {
      setTeam1(team1.filter(p => p !== player))
      if (!team2.includes(player)) {
        setTeam2([...team2, player])
      }
    }
  }

  const handleDragStart = (e: React.DragEvent, player: string) => {
    setDraggedPlayer(player)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropTeam1 = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedPlayer) {
      // Si viene del equipo 2, removerlo de ahí
      if (team2.includes(draggedPlayer)) {
        setTeam2(team2.filter(p => p !== draggedPlayer))
      }
      // Agregarlo al equipo 1 si no está ya
      if (!team1.includes(draggedPlayer)) {
        setTeam1([...team1, draggedPlayer])
      }
      setDraggedPlayer(null)
    }
  }

  const handleDropTeam2 = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedPlayer) {
      // Si viene del equipo 1, removerlo de ahí
      if (team1.includes(draggedPlayer)) {
        setTeam1(team1.filter(p => p !== draggedPlayer))
      }
      // Agregarlo al equipo 2 si no está ya
      if (!team2.includes(draggedPlayer)) {
        setTeam2([...team2, draggedPlayer])
      }
      setDraggedPlayer(null)
    }
  }

  const handleDropAvailable = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedPlayer) {
      // Remover del equipo que esté
      setTeam1(team1.filter(p => p !== draggedPlayer))
      setTeam2(team2.filter(p => p !== draggedPlayer))
      setDraggedPlayer(null)
    }
  }

  const removeFromTeam = (player: string, team: 'team1' | 'team2') => {
    if (team === 'team1') {
      setTeam1(team1.filter(p => p !== player))
    } else {
      setTeam2(team2.filter(p => p !== player))
    }
  }

  const handleCreateMatch = () => {
    if (team1.length > 0 && team2.length > 0 && winner) {
      onCreateMatch(team1, team2, winner)
      // Reset form
      setTeam1([])
      setTeam2([])
      setWinner(null)
    }
  }

  const formatTeam = (team: string[]) => team.join(', ')

  return (
    <div className="space-y-4 sm:space-y-6 p-1">
      {/* Jugadores Disponibles */}
      <div>
        <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block text-green-700">
          Jugadores Disponibles
        </Label>
        <div
          className="flex flex-wrap gap-1 sm:gap-2 p-3 sm:p-4 border-2 border-dashed border-green-300 rounded-lg min-h-[60px] sm:min-h-[80px] bg-green-50"
          onDragOver={handleDragOver}
          onDrop={handleDropAvailable}
        >
          {availablePlayers.length === 0 ? (
            <span className="text-gray-400 text-xs sm:text-sm">
              Todos los jugadores están asignados a equipos
            </span>
          ) : (
            availablePlayers.map(player => (
              <div key={player} className="flex flex-col gap-1">
                <Badge
                  variant="outline"
                  className="cursor-move hover:bg-green-100 transition-colors px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border-green-300 bg-white"
                  draggable
                  onDragStart={e => handleDragStart(e, player)}
                >
                  {player}
                </Badge>
                {/* Botones para móvil */}
                <div className="flex gap-1 sm:hidden">
                  <button
                    onClick={() => addToTeam(player, 'team1')}
                    className="text-xs px-1 py-0.5 bg-[#819067] text-white rounded hover:bg-[#0A400C]"
                  >
                    →1
                  </button>
                  <button
                    onClick={() => addToTeam(player, 'team2')}
                    className="text-xs px-1 py-0.5 bg-[#1B3C53] text-white rounded hover:bg-[#456882]"
                  >
                    →2
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-green-600 mt-1 sm:mt-2">
          <span className="hidden sm:inline">Arrastra los jugadores a los equipos de abajo</span>
          <span className="sm:hidden">
            Usa los botones →1 o →2 para asignar jugadores a equipos
          </span>
        </p>
      </div>

      {/* Equipos */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Equipo 1 */}
        <div>
          <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-[#819067]">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#819067] rounded-full"></div>
            Equipo 1
          </Label>
          <div
            className="p-3 sm:p-4 border-2 border-dashed border-green-300 rounded-lg min-h-[80px] sm:min-h-[120px] bg-green-50 transition-colors hover:bg-green-100"
            onDragOver={handleDragOver}
            onDrop={handleDropTeam1}
          >
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {team1.map(player => (
                <Badge
                  key={player}
                  className="flex items-center gap-1 bg-[#819067] text-white text-xs sm:text-sm px-2 sm:px-3 py-1"
                >
                  {player}
                  <X
                    className="w-3 h-3 cursor-pointer hover:bg-[#0A400C] rounded"
                    onClick={() => removeFromTeam(player, 'team1')}
                  />
                </Badge>
              ))}
              {team1.length === 0 && (
                <div className="flex items-center justify-center w-full h-12 sm:h-16 text-gray-400">
                  <div className="text-center">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 opacity-50" />
                    <span className="text-xs sm:text-sm">Arrastra jugadores aquí</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Equipo 2 */}
        <div>
          <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-[#1B3C53]">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#1B3C53] rounded-full"></div>
            Equipo 2
          </Label>
          <div
            className="p-3 sm:p-4 border-2 border-dashed border-blue-300 rounded-lg min-h-[80px] sm:min-h-[120px] bg-blue-50 transition-colors hover:bg-blue-100"
            onDragOver={handleDragOver}
            onDrop={handleDropTeam2}
          >
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {team2.map(player => (
                <Badge
                  key={player}
                  className="flex items-center gap-1 bg-[#1B3C53] text-white text-xs sm:text-sm px-2 sm:px-3 py-1"
                >
                  {player}
                  <X
                    className="w-3 h-3 cursor-pointer hover:bg-[#456882] rounded"
                    onClick={() => removeFromTeam(player, 'team2')}
                  />
                </Badge>
              ))}
              {team2.length === 0 && (
                <div className="flex items-center justify-center w-full h-12 sm:h-16 text-gray-400">
                  <div className="text-center">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 opacity-50" />
                    <span className="text-xs sm:text-sm">Arrastra jugadores aquí</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seleccionar ganador */}
      {team1.length > 0 && team2.length > 0 && (
        <div>
          <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block text-green-700">
            Equipo Ganador
          </Label>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <Button
              variant={winner === 'team1' ? 'default' : 'outline'}
              onClick={() => setWinner('team1')}
              className={`h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-center ${
                winner === 'team1'
                  ? 'bg-[#819067] hover:bg-[#0A400C] text-white'
                  : 'border-green-300 hover:bg-green-50 text-green-700'
              }`}
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#819067] rounded-full"></div>
              <div className="font-semibold text-sm sm:text-base">Equipo 1</div>
              <div className="text-xs sm:text-sm opacity-80 break-words">{formatTeam(team1)}</div>
            </Button>
            <Button
              variant={winner === 'team2' ? 'default' : 'outline'}
              onClick={() => setWinner('team2')}
              className={`h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-center ${
                winner === 'team2'
                  ? 'bg-[#1B3C53] hover:bg-[#456882] text-white'
                  : 'border-blue-300 hover:bg-blue-50 text-blue-700'
              }`}
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#1B3C53] rounded-full"></div>
              <div className="font-semibold text-sm sm:text-base">Equipo 2</div>
              <div className="text-xs sm:text-sm opacity-80 break-words">{formatTeam(team2)}</div>
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={handleCreateMatch}
        disabled={team1.length === 0 || team2.length === 0 || !winner}
        className="w-full h-10 sm:h-12 text-sm sm:text-base bg-[#819067] hover:bg-[#0A400C] disabled:bg-gray-300"
      >
        Cargar Resultado
      </Button>
    </div>
  )
}
