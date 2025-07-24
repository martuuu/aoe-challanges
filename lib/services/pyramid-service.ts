import { prisma } from '@/lib/prisma'
import { PyramidUser } from '@/hooks/usePyramid'

export interface RecentMatch {
  id: string
  winnerId: string | null
  loserId: string | null
  winnerLevel?: number
  loserLevel?: number
  type: string
  createdAt: Date
}

export interface PyramidRules {
  // Reglas de desafío
  canChallengeLevel: (challengerLevel: number, challengedLevel: number) => boolean

  // Reglas de movimiento en la pirámide
  shouldSwapPositions: (
    winnerId: string,
    loserId: string,
    winnerLevel: number,
    loserLevel: number
  ) => boolean
  shouldPromoteAfterTwoWins: (
    userId: string,
    userLevel: number,
    recentMatches: RecentMatch[]
  ) => boolean
}

export const pyramidRules: PyramidRules = {
  // Los jugadores pueden desafiar a su mismo nivel o 1 nivel superior
  canChallengeLevel: (challengerLevel: number, challengedLevel: number) => {
    const levelDiff = challengerLevel - challengedLevel
    return levelDiff >= 0 && levelDiff <= 1
  },

  // Si te gana uno de nivel inferior, cambian de lugar
  shouldSwapPositions: (
    winnerId: string,
    loserId: string,
    winnerLevel: number,
    loserLevel: number
  ) => {
    // Solo si el ganador es de nivel inferior al perdedor
    return winnerLevel > loserLevel
  },

  // Si le ganas dos veces al de tu mismo nivel, subes
  shouldPromoteAfterTwoWins: (userId: string, userLevel: number, recentMatches: RecentMatch[]) => {
    if (userLevel === 1) return false // Ya está en el nivel más alto

    // Filtrar matches del usuario como ganador contra jugadores del mismo nivel
    const sameLevelWins = recentMatches.filter(
      match =>
        match.winnerId === userId && match.loserLevel === userLevel && match.type === 'challenge'
    )

    // Verificar si tiene al menos 2 victorias consecutivas contra el mismo nivel
    const recentSameLevelWins = sameLevelWins.slice(-2)
    return recentSameLevelWins.length >= 2
  },
}

export class PyramidService {
  // Procesar resultado de un match y aplicar reglas de la pirámide
  async processMatchResult(
    winnerId: string,
    loserId: string,
    matchType: 'challenge' | 'group' = 'challenge'
  ) {
    const winner = await prisma.user.findUnique({ where: { id: winnerId } })
    const loser = await prisma.user.findUnique({ where: { id: loserId } })

    if (!winner || !loser) {
      throw new Error('Usuario no encontrado')
    }

    const changes: Array<{
      userId: string
      oldLevel: number
      newLevel: number
      reason: string
    }> = []

    // Solo aplicar reglas de pirámide para matches de desafío
    if (matchType === 'challenge') {
      // Regla 1: Si te gana uno de nivel inferior, cambian de lugar
      if (pyramidRules.shouldSwapPositions(winnerId, loserId, winner.level, loser.level)) {
        changes.push({
          userId: winnerId,
          oldLevel: winner.level,
          newLevel: loser.level,
          reason: 'Victoria contra nivel superior - intercambio de posiciones',
        })

        changes.push({
          userId: loserId,
          oldLevel: loser.level,
          newLevel: winner.level,
          reason: 'Derrota contra nivel inferior - intercambio de posiciones',
        })
      }

      // Regla 2: Si le ganas dos veces al de tu mismo nivel, subes
      const recentMatches = await this.getRecentMatches(winnerId)
      if (pyramidRules.shouldPromoteAfterTwoWins(winnerId, winner.level, recentMatches)) {
        changes.push({
          userId: winnerId,
          oldLevel: winner.level,
          newLevel: winner.level - 1,
          reason: 'Promoción por dos victorias consecutivas en el mismo nivel',
        })
      }
    }

    // Aplicar cambios de nivel
    for (const change of changes) {
      await this.updateUserLevel(change.userId, change.newLevel, change.reason)
    }

    return changes
  }

  // Obtener matches recientes de un usuario
  private async getRecentMatches(userId: string, limit: number = 10) {
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ winnerId: userId }, { loserId: userId }],
      },
      include: {
        winner: true,
        loser: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return matches.map(match => ({
      id: match.id,
      winnerId: match.winnerId,
      loserId: match.loserId,
      winnerLevel: match.winner?.level,
      loserLevel: match.loser?.level,
      type: match.type.toLowerCase(),
      createdAt: match.createdAt,
    }))
  }

  // Actualizar nivel de usuario y crear registro de cambio
  private async updateUserLevel(userId: string, newLevel: number, reason: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('Usuario no encontrado')

    // Actualizar nivel del usuario
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    })

    // Crear registro de cambio de nivel
    await prisma.levelChange.create({
      data: {
        userId: userId,
        oldLevel: user.level,
        newLevel: newLevel,
        reason: this.mapReasonToEnum(reason),
      },
    })
  }

  // Mapear razón de texto a enum de Prisma
  private mapReasonToEnum(reason: string) {
    if (reason.includes('intercambio') || reason.includes('superior')) {
      return 'VICTORY_PROMOTION'
    }
    if (reason.includes('inferior')) {
      return 'DEFEAT_DEMOTION'
    }
    if (reason.includes('dos victorias') || reason.includes('consecutivas')) {
      return 'VICTORY_PROMOTION'
    }
    return 'ADMIN_ADJUSTMENT'
  }

  // Validar si un desafío es permitido
  async canChallenge(
    challengerId: string,
    challengedId: string
  ): Promise<{
    canChallenge: boolean
    reason?: string
  }> {
    const challenger = await prisma.user.findUnique({ where: { id: challengerId } })
    const challenged = await prisma.user.findUnique({ where: { id: challengedId } })

    if (!challenger || !challenged) {
      return { canChallenge: false, reason: 'Usuario no encontrado' }
    }

    if (challenger.id === challenged.id) {
      return { canChallenge: false, reason: 'No puedes desafiarte a ti mismo' }
    }

    if (!pyramidRules.canChallengeLevel(challenger.level, challenged.level)) {
      return {
        canChallenge: false,
        reason: 'Solo puedes desafiar a jugadores de tu mismo nivel o 1 nivel superior',
      }
    }

    return { canChallenge: true }
  }

  // Obtener oponentes disponibles para un usuario
  async getAvailableOpponents(userId: string): Promise<PyramidUser[]> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return []

    const opponents = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { isActive: true },
          {
            OR: [
              { level: user.level }, // Mismo nivel
              { level: user.level - 1 }, // Un nivel superior
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        alias: true,
        level: true,
        elo: true,
        wins: true,
        losses: true,
        streak: true,
        totalMatches: true,
      },
    })

    return opponents.map(opponent => ({
      ...opponent,
      winRate:
        opponent.wins + opponent.losses > 0
          ? (opponent.wins / (opponent.wins + opponent.losses)) * 100
          : 0,
    }))
  }

  // Obtener estadísticas de confrontación directa entre dos jugadores
  async getHeadToHeadStats(player1Id: string, player2Id: string) {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { winnerId: player1Id, loserId: player2Id },
          { winnerId: player2Id, loserId: player1Id },
        ],
        type: 'INDIVIDUAL',
      },
      orderBy: { createdAt: 'desc' },
    })

    const player1Wins = matches.filter(m => m.winnerId === player1Id).length
    const player2Wins = matches.filter(m => m.winnerId === player2Id).length

    return {
      totalMatches: matches.length,
      player1Wins,
      player2Wins,
      recentMatches: matches.slice(0, 5),
    }
  }
}

export const pyramidService = new PyramidService()

// Ejemplo de uso:
//
// 1. Validar si un desafío es permitido:
//    const validation = await pyramidService.canChallenge('user1', 'user2')
//
// 2. Obtener oponentes disponibles:
//    const opponents = await pyramidService.getAvailableOpponents('user1')
//
// 3. Procesar resultado de match (automático al completar desafío):
//    const changes = await pyramidService.processMatchResult('winnerId', 'loserId', 'challenge')
//
// 4. Obtener estadísticas head-to-head:
//    const stats = await pyramidService.getHeadToHeadStats('player1', 'player2')
