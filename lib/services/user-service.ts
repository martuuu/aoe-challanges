import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'
// import type { LevelChangeReason } from '@prisma/client' // Para uso futuro

export interface UserStats {
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
  1: UserStats[]
  2: UserStats[]
  3: UserStats[]
  4: UserStats[]
}

export const userService = {
  // Obtener todos los usuarios activos
  async getAllUsers(): Promise<UserStats[]> {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ level: 'asc' }, { elo: 'desc' }],
    })

    return users.map(user => ({
      id: user.id,
      name: user.name,
      alias: user.alias,
      level: user.level,
      elo: user.elo,
      wins: user.wins,
      losses: user.losses,
      streak: user.streak,
      winRate: user.wins + user.losses > 0 ? (user.wins / (user.wins + user.losses)) * 100 : 0,
      totalMatches: user.wins + user.losses,
    }))
  },

  // Obtener datos de la pirámide
  async getPyramidData(): Promise<PyramidData> {
    const users = await this.getAllUsers()

    const pyramid: PyramidData = {
      1: [],
      2: [],
      3: [],
      4: [],
    }

    users.forEach(user => {
      const level = user.level as keyof PyramidData
      if (pyramid[level]) {
        pyramid[level].push(user)
      }
    })

    return pyramid
  },

  // Obtener usuario por ID
  async getUserById(id: string): Promise<UserStats | null> {
    const user = await prisma.user.findUnique({
      where: { id, isActive: true },
    })

    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      alias: user.alias,
      level: user.level,
      elo: user.elo,
      wins: user.wins,
      losses: user.losses,
      streak: user.streak,
      winRate: user.wins + user.losses > 0 ? (user.wins / (user.wins + user.losses)) * 100 : 0,
      totalMatches: user.wins + user.losses,
    }
  },

  // Obtener usuarios por nivel
  async getUsersByLevel(level: number): Promise<UserStats[]> {
    const users = await prisma.user.findMany({
      where: {
        level,
        isActive: true,
      },
      orderBy: { elo: 'desc' },
    })

    return users.map(user => ({
      id: user.id,
      name: user.name,
      alias: user.alias,
      level: user.level,
      elo: user.elo,
      wins: user.wins,
      losses: user.losses,
      streak: user.streak,
      winRate: user.wins + user.losses > 0 ? (user.wins / (user.wins + user.losses)) * 100 : 0,
      totalMatches: user.wins + user.losses,
    }))
  },

  // Obtener estadísticas del mes
  async getMonthStats() {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Matches del mes
    const monthMatches = await prisma.match.findMany({
      where: {
        completedAt: {
          gte: startOfMonth,
        },
      },
      include: {
        winner: true,
        loser: true,
      },
    })

    // Calcular estadísticas
    const winCounts: { [key: string]: number } = {}
    const loseCounts: { [key: string]: number } = {}

    monthMatches.forEach(match => {
      if (match.winner) {
        winCounts[match.winner.alias] = (winCounts[match.winner.alias] || 0) + 1
      }
      if (match.loser) {
        loseCounts[match.loser.alias] = (loseCounts[match.loser.alias] || 0) + 1
      }
    })

    // Top winner
    const topWinnerAlias = Object.keys(winCounts).reduce(
      (a, b) => (winCounts[a] > winCounts[b] ? a : b),
      Object.keys(winCounts)[0] || 'N/A'
    )

    // Top loser
    const topLoserAlias = Object.keys(loseCounts).reduce(
      (a, b) => (loseCounts[a] > loseCounts[b] ? a : b),
      Object.keys(loseCounts)[0] || 'N/A'
    )

    // Mejor racha actual
    const users = await this.getAllUsers()
    const bestStreak = users.reduce(
      (prev, current) => (current.streak > prev.streak ? current : prev),
      users[0] || { alias: 'N/A', streak: 0 }
    )

    // Más escalador (esto requeriría tracking de cambios de nivel)
    const mostClimbed = { alias: 'N/A', positions: 0 }

    return {
      topWinner: { name: topWinnerAlias, wins: winCounts[topWinnerAlias] || 0 },
      topLoser: { name: topLoserAlias, losses: loseCounts[topLoserAlias] || 0 },
      bestStreak: { name: bestStreak.alias, streak: bestStreak.streak },
      mostClimbed,
    }
  },

  // Actualizar nivel de usuario
  async updateUserLevel(userId: string, newLevel: number): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('Usuario no encontrado')

    // Crear registro de cambio de nivel
    await prisma.levelChange.create({
      data: {
        userId,
        oldLevel: user.level,
        newLevel,
        reason: 'ADMIN_ADJUSTMENT', // Usar valor enum por defecto
      },
    })

    // Actualizar usuario
    return await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    })
  },

  // Actualizar ELO de usuario
  async updateUserElo(
    userId: string,
    newElo: number,
    matchId?: string,
    reason?: string
  ): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('Usuario no encontrado')

    // Crear registro de historial ELO
    await prisma.eloHistory.create({
      data: {
        userId,
        oldElo: user.elo,
        newElo,
        matchId,
        reason: reason || 'Match result',
      },
    })

    // Actualizar usuario
    return await prisma.user.update({
      where: { id: userId },
      data: { elo: newElo },
    })
  },

  // Obtener estadísticas completas de usuario
  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userStats: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!user) throw new Error('Usuario no encontrado')

    // Usar estadísticas del modelo User directamente
    const levelDays = user.level1Days + user.level2Days + user.level3Days + user.level4Days

    return {
      id: user.id,
      totalMatches: user.totalMatches,
      wins: user.wins,
      losses: user.losses,
      currentStreak: user.streak,
      level: user.level,
      levelDays,
      nextPromotionElo: user.level < 4 ? user.elo + 50 * (5 - user.level) : undefined,
      promotions: user.promotions,
      demotions: user.demotions,
      bestStreak: user.bestStreak,
    }
  },

  // Obtener ranking de usuario
  async getUserRanking(userId: string) {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ level: 'asc' }, { elo: 'desc' }],
      select: { id: true, level: true, elo: true },
    })

    const position = users.findIndex(user => user.id === userId) + 1

    return {
      position,
      totalPlayers: users.length,
    }
  },

  // Obtener total de usuarios
  async getTotalUsers(): Promise<number> {
    return await prisma.user.count({
      where: { isActive: true },
    })
  },
}
