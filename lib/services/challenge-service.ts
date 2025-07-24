import { prisma } from '@/lib/prisma'
import type { Challenge, ChallengeType, User } from '@prisma/client'
import { calculateEloChange } from '@/lib/ranking-system'
import { userService } from './user-service'
// import type { ChallengeStatus } from '@prisma/client' // No usado temporalmente

export interface CreateChallengeData {
  challengerId: string
  challengedId: string
  type?: ChallengeType
  expiresAt?: Date
}

export interface ChallengeWithUsers extends Challenge {
  challenger: {
    id: string
    name: string
    alias: string
    level: number
  }
  challenged: {
    id: string
    name: string
    alias: string
    level: number
  }
}

export const challengeService = {
  // Crear un nuevo desafío
  async createChallenge(data: CreateChallengeData): Promise<Challenge> {
    // Validar que los usuarios existan antes de crear el challenge
    const [challenger, challenged] = await Promise.all([
      prisma.user.findUnique({
        where: { id: data.challengerId },
        select: { id: true, alias: true },
      }),
      prisma.user.findUnique({
        where: { id: data.challengedId },
        select: { id: true, alias: true },
      }),
    ])

    if (!challenger) {
      throw new Error(
        `Usuario challenger con ID "${data.challengerId}" no encontrado en la base de datos`
      )
    }

    if (!challenged) {
      throw new Error(
        `Usuario challenged con ID "${data.challengedId}" no encontrado en la base de datos`
      )
    }

    // Determinar el tiempo de expiración según el tipo
    let expiresAt: Date
    if (data.expiresAt) {
      expiresAt = data.expiresAt
    } else if (data.type === 'SUGGESTION') {
      // Sugerencias expiran en 48 horas para ser aceptadas
      expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
    } else {
      // Desafíos individuales expiran en 48 horas para ser aceptados
      expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
    }

    // Crear el challenge con estados individuales según el tipo
    const challenge = await prisma.challenge.create({
      data: {
        challengerId: data.challengerId,
        challengedId: data.challengedId,
        type: data.type || 'INDIVIDUAL',
        status: 'PENDING',
        // Para desafíos individuales, el challenger acepta automáticamente
        challengerStatus: data.type === 'INDIVIDUAL' ? 'ACCEPTED' : 'PENDING',
        // Para sugerencias, ambos empiezan como pending
        challengedStatus: 'PENDING',
        expiresAt,
      },
    })

    return challenge
  },

  // Obtener desafíos pendientes
  async getPendingChallenges(): Promise<ChallengeWithUsers[]> {
    return await prisma.challenge.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        challenger: {
          select: {
            id: true,
            name: true,
            alias: true,
            level: true,
          },
        },
        challenged: {
          select: {
            id: true,
            name: true,
            alias: true,
            level: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  // Obtener desafíos recientes
  async getRecentChallenges(limit = 10): Promise<ChallengeWithUsers[]> {
    return await prisma.challenge.findMany({
      include: {
        challenger: {
          select: {
            id: true,
            name: true,
            alias: true,
            level: true,
          },
        },
        challenged: {
          select: {
            id: true,
            name: true,
            alias: true,
            level: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  },

  // Aceptar un desafío (método legacy - usar updatePlayerStatus)
  async acceptChallenge(challengeId: string): Promise<Challenge> {
    // Este método se mantiene por compatibilidad pero ya no debería usarse
    // El nuevo flujo debe usar updatePlayerStatus
    return await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    })
  },

  // Actualizar estado individual de un jugador en un challenge
  async updatePlayerStatus(
    challengeId: string,
    userId: string,
    status: 'ACCEPTED' | 'REJECTED'
  ): Promise<Challenge> {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    })

    if (!challenge) {
      throw new Error('Desafío no encontrado')
    }

    const updateData: {
      challengerStatus?: 'ACCEPTED' | 'REJECTED' | 'PENDING'
      challengedStatus?: 'ACCEPTED' | 'REJECTED' | 'PENDING'
      status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'
      acceptedAt?: Date
      expiresAt?: Date
    } = {}

    if (challenge.challengerId === userId) {
      updateData.challengerStatus = status
    } else if (challenge.challengedId === userId) {
      updateData.challengedStatus = status
    } else {
      throw new Error('Usuario no tiene permisos para actualizar este desafío')
    }

    if (status === 'REJECTED') {
      updateData.status = 'REJECTED'
    }

    // Si ambos jugadores han aceptado, cambiar el status general a ACCEPTED
    const otherPlayerStatus =
      challenge.challengerId === userId ? challenge.challengedStatus : challenge.challengerStatus

    if (status === 'ACCEPTED' && otherPlayerStatus === 'ACCEPTED') {
      updateData.status = 'ACCEPTED'
      updateData.acceptedAt = new Date()
      // Extender el plazo a 1 semana para concretar el partido
      updateData.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }

    return await prisma.challenge.update({
      where: { id: challengeId },
      data: updateData,
    })
  },

  // Completar un desafío (crear match)
  async completeChallenge(challengeId: string, winnerId: string): Promise<Challenge> {
    // Primero obtener el desafío con información de usuarios
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        challenger: true,
        challenged: true,
      },
    })

    if (!challenge) {
      throw new Error('Desafío no encontrado')
    }

    const loserId =
      challenge.challengerId === winnerId ? challenge.challengedId : challenge.challengerId

    // Obtener datos actuales de ambos usuarios
    const [winner, loser] = await Promise.all([
      prisma.user.findUnique({ where: { id: winnerId } }),
      prisma.user.findUnique({ where: { id: loserId } }),
    ])

    if (!winner || !loser) {
      throw new Error('Usuarios no encontrados')
    }

    // Calcular cambios de ELO
    const { winnerNewElo, loserNewElo } = calculateEloChange(winner.elo, loser.elo, 32)

    // Crear el match
    const match = await prisma.match.create({
      data: {
        winnerId,
        loserId,
        type: 'INDIVIDUAL',
        challengeId,
        completedAt: new Date(),
      },
    })

    // Actualizar ELO y crear historial
    await Promise.all([
      userService.updateUserElo(
        winnerId,
        winnerNewElo,
        match.id,
        `Victoria vs ${loser.alias} (+${winnerNewElo - winner.elo})`
      ),
      userService.updateUserElo(
        loserId,
        loserNewElo,
        match.id,
        `Derrota vs ${winner.alias} (${loserNewElo - loser.elo})`
      ),
    ])

    // Determinar cambios de nivel según las reglas de la pirámide
    await this.applyPyramidRules(winner, loser, winnerId, loserId)

    // Actualizar estadísticas básicas de los usuarios
    await Promise.all([
      prisma.user.update({
        where: { id: winnerId },
        data: {
          wins: { increment: 1 },
          totalMatches: { increment: 1 },
          streak: winner.streak >= 0 ? winner.streak + 1 : 1, // Continúa racha positiva o inicia nueva
          bestStreak:
            winner.streak >= 0 && winner.streak + 1 > winner.bestStreak
              ? winner.streak + 1
              : winner.bestStreak,
          elo: winnerNewElo,
        },
      }),
      prisma.user.update({
        where: { id: loserId },
        data: {
          losses: { increment: 1 },
          totalMatches: { increment: 1 },
          streak: loser.streak <= 0 ? loser.streak - 1 : -1, // Continúa racha negativa o inicia nueva
          elo: loserNewElo,
        },
      }),
    ])

    // Actualizar el desafío
    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        winnerId,
      },
    })

    return updatedChallenge
  },

  // Aplicar reglas de la pirámide
  async applyPyramidRules(winner: User, loser: User, winnerId: string, loserId: string) {
    const winnerLevel = winner.level
    const loserLevel = loser.level

    // REGLA 1: Si ganas contra alguien de nivel superior, intercambias posiciones
    if (loserLevel < winnerLevel) {
      // El ganador (nivel inferior) sube al nivel del perdedor
      // El perdedor (nivel superior) baja al nivel del ganador
      await Promise.all([
        this.updateUserLevelWithHistory(winnerId, loserLevel, 'VICTORY_PROMOTION'),
        this.updateUserLevelWithHistory(loserId, winnerLevel, 'DEFEAT_DEMOTION'),
      ])
      return
    }

    // REGLA 2: Si ganas 2 veces consecutivas contra alguien de tu mismo nivel, subes un nivel
    if (loserLevel === winnerLevel && winnerLevel > 1) {
      // Verificar si es la segunda victoria consecutiva contra el mismo nivel
      const recentMatches = await prisma.match.findMany({
        where: {
          winnerId,
          completedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
          },
        },
        include: {
          loser: { select: { level: true, alias: true } },
        },
        orderBy: { completedAt: 'desc' },
        take: 2,
      })

      // Verificar si las últimas 2 victorias fueron contra jugadores del mismo nivel
      if (recentMatches.length >= 2) {
        const lastTwoSameLevel = recentMatches.every(
          match => match.loser && match.loser.level === winnerLevel
        )

        if (lastTwoSameLevel) {
          await this.updateUserLevelWithHistory(winnerId, winnerLevel - 1, 'VICTORY_PROMOTION')
        }
      }
    }

    // REGLA 3: Si pierdes 2 veces consecutivas contra alguien de tu mismo nivel, bajas un nivel
    if (loserLevel === winnerLevel && loserLevel < 4) {
      const recentLosses = await prisma.match.findMany({
        where: {
          loserId,
          completedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
          },
        },
        include: {
          winner: { select: { level: true, alias: true } },
        },
        orderBy: { completedAt: 'desc' },
        take: 2,
      })

      if (recentLosses.length >= 2) {
        const lastTwoSameLevel = recentLosses.every(
          match => match.winner && match.winner.level === loserLevel
        )

        if (lastTwoSameLevel) {
          await this.updateUserLevelWithHistory(loserId, loserLevel + 1, 'CONSECUTIVE_DEFEATS')
        }
      }
    }
  },

  // Actualizar nivel de usuario con historial
  async updateUserLevelWithHistory(
    userId: string,
    newLevel: number,
    reason: 'VICTORY_PROMOTION' | 'DEFEAT_DEMOTION' | 'CONSECUTIVE_DEFEATS' | 'ADMIN_ADJUSTMENT'
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return

    const oldLevel = user.level

    // Crear registro de cambio de nivel
    await prisma.levelChange.create({
      data: {
        userId,
        oldLevel,
        newLevel,
        reason,
      },
    })

    // Actualizar el nivel del usuario y contadores de promociones/descensos
    const isPromotion = newLevel < oldLevel
    const isDemotion = newLevel > oldLevel

    await prisma.user.update({
      where: { id: userId },
      data: {
        level: newLevel,
        ...(isPromotion && { promotions: { increment: 1 } }),
        ...(isDemotion && { demotions: { increment: 1 } }),
      },
    })
  },

  // Expirar desafíos vencidos
  async expireChallenges(): Promise<number> {
    const result = await prisma.challenge.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: 'EXPIRED',
      },
    })

    return result.count
  },

  // Cancelar un desafío
  async cancelChallenge(challengeId: string): Promise<Challenge> {
    return await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })
  },

  // Rechazar un desafío
  async rejectChallenge(challengeId: string, reason?: string): Promise<Challenge> {
    return await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    })
  },

  // Obtener estadísticas de desafíos por usuario
  async getChallengeStats(userId: string) {
    try {
      // Hacer una sola consulta que obtenga todos los challenges del usuario
      const userChallenges = await prisma.challenge.findMany({
        where: {
          OR: [{ challengerId: userId }, { challengedId: userId }],
        },
        select: {
          challengerId: true,
          challengedId: true,
          status: true,
          winnerId: true,
        },
      })

      // Calcular estadísticas en memoria
      let sent = 0
      let received = 0
      let accepted = 0
      let rejected = 0
      let won = 0
      let lost = 0

      userChallenges.forEach(challenge => {
        // Challenges enviados
        if (challenge.challengerId === userId) {
          sent++
        }

        // Challenges recibidos
        if (challenge.challengedId === userId) {
          received++

          if (challenge.status === 'ACCEPTED') {
            accepted++
          } else if (challenge.status === 'REJECTED') {
            rejected++
          }
        }

        // Wins y losses (solo para challenges completados)
        if (challenge.status === 'COMPLETED' && challenge.winnerId) {
          if (challenge.winnerId === userId) {
            won++
          } else if (challenge.challengerId === userId || challenge.challengedId === userId) {
            lost++
          }
        }
      })

      return {
        challengesSent: sent,
        challengesReceived: received,
        challengesAccepted: accepted,
        challengesRejected: rejected,
        challengesWon: won,
        challengesLost: lost,
        acceptanceRate: received > 0 ? (accepted / received) * 100 : 0,
        winRate: won + lost > 0 ? (won / (won + lost)) * 100 : 0,
      }
    } catch (error) {
      console.error('Error in getChallengeStats:', error)
      // Retornar estadísticas vacías en caso de error
      return {
        challengesSent: 0,
        challengesReceived: 0,
        challengesAccepted: 0,
        challengesRejected: 0,
        challengesWon: 0,
        challengesLost: 0,
        acceptanceRate: 0,
        winRate: 0,
      }
    }
  },

  // Obtener head-to-head entre dos usuarios
  async getHeadToHead(userId1: string, userId2: string) {
    const matches = await prisma.challenge.findMany({
      where: {
        OR: [
          { challengerId: userId1, challengedId: userId2 },
          { challengerId: userId2, challengedId: userId1 },
        ],
        status: 'COMPLETED',
      },
      include: {
        challenger: { select: { alias: true } },
        challenged: { select: { alias: true } },
      },
    })

    const user1Wins = matches.filter(m => m.winnerId === userId1).length
    const user2Wins = matches.filter(m => m.winnerId === userId2).length

    return {
      totalMatches: matches.length,
      user1Wins,
      user2Wins,
      matches: matches.map(m => ({
        date: m.completedAt,
        challenger: m.challenger.alias,
        challenged: m.challenged.alias,
        winner: m.winnerId === userId1 ? 'user1' : 'user2',
      })),
    }
  },

  // Obtener desafíos activos por usuario
  async getActiveChallengesByUser(userId: string): Promise<ChallengeWithUsers[]> {
    return await prisma.challenge.findMany({
      where: {
        OR: [{ challengerId: userId }, { challengedId: userId }],
        status: { in: ['PENDING', 'ACCEPTED'] },
        expiresAt: { gte: new Date() },
      },
      include: {
        challenger: {
          select: { id: true, name: true, alias: true, level: true },
        },
        challenged: {
          select: { id: true, name: true, alias: true, level: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  // Obtener desafíos pendientes por usuario
  async getPendingChallengesByUser(userId: string): Promise<ChallengeWithUsers[]> {
    return await prisma.challenge.findMany({
      where: {
        challengedId: userId,
        status: 'PENDING',
        expiresAt: { gte: new Date() },
      },
      include: {
        challenger: {
          select: { id: true, name: true, alias: true, level: true },
        },
        challenged: {
          select: { id: true, name: true, alias: true, level: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  // Obtener desafíos aceptados que esperan confirmación de ganador
  async getAcceptedChallenges(): Promise<ChallengeWithUsers[]> {
    return await prisma.challenge.findMany({
      where: {
        status: 'ACCEPTED',
        expiresAt: { gte: new Date() },
      },
      include: {
        challenger: {
          select: { id: true, name: true, alias: true, level: true },
        },
        challenged: {
          select: { id: true, name: true, alias: true, level: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },
}
