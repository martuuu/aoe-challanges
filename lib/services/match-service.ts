import { prisma } from '@/lib/prisma'
import type { Match, MatchType } from '@prisma/client'

export interface CreateGroupMatchData {
  team1: string[] // aliases
  team2: string[] // aliases
  winner: 'team1' | 'team2'
  type?: MatchType
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

    console.log(
      `Match grupal creado: ${team1.join(', ')} vs ${team2.join(', ')}. Ganador: ${winner}`
    )
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
