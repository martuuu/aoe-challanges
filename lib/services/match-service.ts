import { prisma } from '@/lib/prisma'
import type { Match, MatchType } from '@prisma/client'
import { pyramidService } from './pyramid-service'

export interface CreateGroupMatchData {
  team1: string[] // aliases
  team2: string[] // aliases
  winner: 'team1' | 'team2'
  type?: MatchType
}

export interface CreateIndividualMatchData {
  winnerId: string
  loserId: string
  challengeId?: string
  notes?: string
}

export interface MatchWithUsers extends Match {
  winner?: {
    id: string
    name: string
    alias: string
    level: number
  } | null
  loser?: {
    id: string
    name: string
    alias: string
    level: number
  } | null
}

export const matchService = {
  // Crear un match individual (de desafío)
  async createIndividualMatch(data: CreateIndividualMatchData): Promise<{
    match: Match
    pyramidChanges: Array<{
      userId: string
      oldLevel: number
      newLevel: number
      reason: string
    }>
  }> {
    const { winnerId, loserId, challengeId, notes } = data

    // Crear el match
    const match = await prisma.match.create({
      data: {
        winnerId,
        loserId,
        type: 'INDIVIDUAL',
        challengeId,
        notes,
        completedAt: new Date(),
      },
    })

    // Actualizar estadísticas de los usuarios
    await Promise.all([
      prisma.user.update({
        where: { id: winnerId },
        data: {
          wins: { increment: 1 },
          totalMatches: { increment: 1 },
          streak: { increment: 1 },
        },
      }),
      prisma.user.update({
        where: { id: loserId },
        data: {
          losses: { increment: 1 },
          totalMatches: { increment: 1 },
          streak: 0, // Reset streak on loss
        },
      }),
    ])

    // Procesar reglas de la pirámide
    const pyramidChanges = await pyramidService.processMatchResult(winnerId, loserId, 'challenge')

    // Actualizar el desafío como completado si existe
    if (challengeId) {
      await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          status: 'COMPLETED',
          winnerId,
          completedAt: new Date(),
        },
      })
    }

    return { match, pyramidChanges }
  },

  // Crear un match grupal directamente (sin desafío previo)
  async createGroupMatch(data: CreateGroupMatchData): Promise<Match> {
    const { team1, team2, winner } = data

    // Buscar los usuarios por alias
    const allAliases = [...team1, ...team2]
    const users = await prisma.user.findMany({
      where: {
        alias: { in: allAliases },
        isActive: true,
      },
    })

    // Crear el match principal
    const match = await prisma.match.create({
      data: {
        type: 'GROUP',
        completedAt: new Date(),
      },
    })

    // Crear el grupo match
    const groupMatch = await prisma.groupMatch.create({
      data: {
        matchId: match.id,
        winningTeam: winner === 'team1' ? 1 : 2,
      },
    })

    // Crear los participantes
    const participants = []

    // Agregar team1
    for (const alias of team1) {
      const user = users.find(u => u.alias === alias)
      if (user) {
        participants.push({
          groupMatchId: groupMatch.id,
          userId: user.id,
          team: 1,
        })
      }
    }

    // Agregar team2
    for (const alias of team2) {
      const user = users.find(u => u.alias === alias)
      if (user) {
        participants.push({
          groupMatchId: groupMatch.id,
          userId: user.id,
          team: 2,
        })
      }
    }

    // Crear todos los participantes
    await prisma.groupMatchParticipant.createMany({
      data: participants,
    })

    return match
  },

  // Obtener matches recientes
  async getRecentMatches(limit = 10): Promise<MatchWithUsers[]> {
    return (await prisma.match.findMany({
      include: {
        winner: {
          select: {
            id: true,
            name: true,
            alias: true,
            level: true,
          },
        },
        loser: {
          select: {
            id: true,
            name: true,
            alias: true,
            level: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: limit,
    })) as MatchWithUsers[]
  },

  // Obtener matches de un usuario específico
  async getUserMatches(userId: string, limit = 10): Promise<MatchWithUsers[]> {
    return (await prisma.match.findMany({
      where: {
        OR: [{ winnerId: userId }, { loserId: userId }],
      },
      include: {
        winner: {
          select: {
            id: true,
            name: true,
            alias: true,
            level: true,
          },
        },
        loser: {
          select: {
            id: true,
            name: true,
            alias: true,
            level: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: limit,
    })) as MatchWithUsers[]
  },

  // Obtener estadísticas de matches
  async getMatchStats(userId?: string) {
    const whereClause = userId
      ? {
          OR: [{ winnerId: userId }, { loserId: userId }],
        }
      : {}

    const [total, individual, group] = await Promise.all([
      prisma.match.count({ where: whereClause }),
      prisma.match.count({ where: { ...whereClause, type: 'INDIVIDUAL' } }),
      prisma.match.count({ where: { ...whereClause, type: 'GROUP' } }),
    ])

    return {
      totalMatches: total,
      individualMatches: individual,
      groupMatches: group,
    }
  },
}
