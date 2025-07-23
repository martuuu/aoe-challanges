import { NextResponse } from 'next/server'
import { challengeService } from '@/lib/services/challenge-service'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        alias: true,
        level: true,
      },
    })

    // Obtener estadísticas de desafíos para todos los usuarios
    const userStats = await Promise.all(
      users.map(async (user) => {
        try {
          const challengeStats = await challengeService.getChallengeStats(user.id)
          return {
            userId: user.id,
            alias: user.alias,
            level: user.level,
            challengeStats,
          }
        } catch (error) {
          console.error(`Error getting stats for user ${user.id}:`, error)
          return {
            userId: user.id,
            alias: user.alias,
            level: user.level,
            challengeStats: {
              challengesSent: 0,
              challengesReceived: 0,
              challengesAccepted: 0,
              challengesRejected: 0,
              challengesWon: 0,
              challengesLost: 0,
              acceptanceRate: 0,
              winRate: 0,
            },
          }
        }
      })
    )

    return NextResponse.json({
      userStats,
      success: true,
    })
  } catch (error) {
    console.error('Error obteniendo estadísticas de todos los usuarios:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
