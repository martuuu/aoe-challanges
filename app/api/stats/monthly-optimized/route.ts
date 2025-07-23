import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)

    // Calcular estadísticas mensuales directamente en la base de datos
    const [
      topWinner,
      topLoser,
      bestStreakUser,
      mostChallengesSent,
      bestAcceptanceRateData,
      mostActivePlayer,
    ] = await Promise.all([
      // Top ganador del mes
      prisma.match.groupBy({
        by: ['winnerId'],
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          winnerId: { not: null },
        },
        _count: { winnerId: true },
        orderBy: { _count: { winnerId: 'desc' } },
        take: 1,
      }),

      // Top perdedor del mes
      prisma.match.groupBy({
        by: ['loserId'],
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          loserId: { not: null },
        },
        _count: { loserId: true },
        orderBy: { _count: { loserId: 'desc' } },
        take: 1,
      }),

      // Usuario con mejor racha actual
      prisma.user.findFirst({
        select: { alias: true, bestStreak: true },
        orderBy: { bestStreak: 'desc' },
      }),

      // Más desafíos enviados del mes
      prisma.challenge.groupBy({
        by: ['challengerId'],
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _count: { challengerId: true },
        orderBy: { _count: { challengerId: 'desc' } },
        take: 1,
      }),

      // Para tasa de aceptación, necesitamos hacer un cálculo más complejo
      prisma.challenge.groupBy({
        by: ['challengedId'],
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _count: { challengedId: true },
        orderBy: { _count: { challengedId: 'desc' } },
        take: 5, // Top 5 para calcular acceptance rate
      }),

      // Jugador más activo (más matches del mes)
      prisma.$queryRaw<Array<{ alias: string; match_count: bigint }>>`
        SELECT 
          u.alias,
          COUNT(*) as match_count
        FROM "matches" m
        JOIN "users" u ON (u.id = m."winnerId" OR u.id = m."loserId")
        WHERE m."createdAt" >= ${startOfMonth} AND m."createdAt" <= ${endOfMonth}
        GROUP BY u.id, u.alias
        ORDER BY match_count DESC
        LIMIT 1
      `,
    ])

    // Obtener nombres de usuarios para los IDs
    const userIds = [
      topWinner[0]?.winnerId,
      topLoser[0]?.loserId,
      mostChallengesSent[0]?.challengerId,
    ].filter((id): id is string => Boolean(id))

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, alias: true },
    })

    const getUserAlias = (id: string) => users.find(u => u.id === id)?.alias || 'Sin datos'

    // Calcular acceptance rate para el top challenged user
    let bestAcceptanceRate = { name: 'Sin datos', rate: 0 }
    if (bestAcceptanceRateData.length > 0) {
      const acceptanceRates = await Promise.all(
        bestAcceptanceRateData.map(async data => {
          const [total, accepted] = await Promise.all([
            prisma.challenge.count({
              where: {
                challengedId: data.challengedId,
                createdAt: { gte: startOfMonth, lte: endOfMonth },
              },
            }),
            prisma.challenge.count({
              where: {
                challengedId: data.challengedId,
                status: 'ACCEPTED',
                createdAt: { gte: startOfMonth, lte: endOfMonth },
              },
            }),
          ])

          const user = await prisma.user.findUnique({
            where: { id: data.challengedId },
            select: { alias: true },
          })

          return {
            name: user?.alias || 'Sin datos',
            rate: total > 0 ? Math.round((accepted / total) * 100) : 0,
          }
        })
      )

      bestAcceptanceRate = acceptanceRates.reduce((best, current) =>
        current.rate > best.rate ? current : best
      )
    }

    const monthlyStats = {
      topWinner: {
        name: topWinner[0] ? getUserAlias(topWinner[0].winnerId!) : 'Sin datos',
        wins: topWinner[0]?._count.winnerId || 0,
      },
      topLoser: {
        name: topLoser[0] ? getUserAlias(topLoser[0].loserId!) : 'Sin datos',
        losses: topLoser[0]?._count.loserId || 0,
      },
      bestStreak: {
        name: bestStreakUser?.alias || 'Sin datos',
        streak: bestStreakUser?.bestStreak || 0,
      },
      mostClimbed: {
        name: 'Sin datos', // TODO: Implementar con ranking history
        positions: 0,
      },
      mostChallengesSent: {
        name: mostChallengesSent[0]
          ? getUserAlias(mostChallengesSent[0].challengerId)
          : 'Sin datos',
        challenges: mostChallengesSent[0]?._count.challengerId || 0,
      },
      bestAcceptanceRate: {
        name: bestAcceptanceRate.name,
        rate: bestAcceptanceRate.rate,
      },
      mostActivePlayer: {
        name: mostActivePlayer[0]?.alias || 'Sin datos',
        matches: Number(mostActivePlayer[0]?.match_count || 0),
      },
    }

    return NextResponse.json({
      stats: monthlyStats,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching monthly stats:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
