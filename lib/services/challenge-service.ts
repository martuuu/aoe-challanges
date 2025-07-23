import { prisma } from '@/lib/prisma'
import type { Challenge, ChallengeType } from '@prisma/client'
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
    // Determinar el tiempo de expiración según el tipo
    let expiresAt: Date
    if (data.expiresAt) {
      expiresAt = data.expiresAt
    } else if (data.type === 'SUGGESTION') {
      // Sugerencias expiran en 2 semanas
      expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    } else {
      // Desafíos individuales expiran en 1 semana
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }

    return await prisma.challenge.create({
      data: {
        challengerId: data.challengerId,
        challengedId: data.challengedId,
        type: data.type || 'INDIVIDUAL',
        status: 'PENDING',
        expiresAt,
      },
    })
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

  // Aceptar un desafío
  async acceptChallenge(challengeId: string): Promise<Challenge> {
    return await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    })
  },

  // Completar un desafío (crear match)
  async completeChallenge(challengeId: string, winnerId: string): Promise<Challenge> {
    // Primero obtener el desafío
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    })

    if (!challenge) {
      throw new Error('Desafío no encontrado')
    }

    const loserId =
      challenge.challengerId === winnerId ? challenge.challengedId : challenge.challengerId

    // Crear el match
    await prisma.match.create({
      data: {
        winnerId,
        loserId,
        type: 'INDIVIDUAL',
        challengeId,
        completedAt: new Date(),
      },
    })

    // Actualizar el desafío
    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        winnerId,
      },
    })

    // Actualizar estadísticas de los usuarios
    await Promise.all([
      prisma.user.update({
        where: { id: winnerId },
        data: {
          wins: { increment: 1 },
          streak: { increment: 1 },
        },
      }),
      prisma.user.update({
        where: { id: loserId },
        data: {
          losses: { increment: 1 },
          streak: 0, // Reset streak on loss
        },
      }),
    ])

    return updatedChallenge
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
    const [sent, received, accepted, rejected, won, lost] = await Promise.all([
      prisma.challenge.count({
        where: { challengerId: userId },
      }),
      prisma.challenge.count({
        where: { challengedId: userId },
      }),
      prisma.challenge.count({
        where: { challengedId: userId, status: 'ACCEPTED' },
      }),
      prisma.challenge.count({
        where: { challengedId: userId, status: 'REJECTED' },
      }),
      prisma.challenge.count({
        where: {
          OR: [
            { challengerId: userId, winnerId: userId },
            { challengedId: userId, winnerId: userId },
          ],
          status: 'COMPLETED',
        },
      }),
      prisma.challenge.count({
        where: {
          OR: [
            { challengerId: userId, winnerId: { not: userId } },
            { challengedId: userId, winnerId: { not: userId } },
          ],
          status: 'COMPLETED',
        },
      }),
    ])

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
