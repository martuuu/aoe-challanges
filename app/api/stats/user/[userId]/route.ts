import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 })
    }

    // Traer datos del usuario y calcular estadísticas específicas
    const [
      user,
      userPosition,
      totalUsers,
      activeChallenges,
      pendingChallenges,
      recentMatches,
      monthlyMatches,
    ] = await Promise.all([
      // Datos básicos del usuario
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          alias: true,
          level: true,
          elo: true,
          wins: true,
          losses: true,
          streak: true,
          totalMatches: true,
          promotions: true,
          demotions: true,
          createdAt: true,
        },
      }),

      // Posición en ranking (optimizado)
      prisma.$queryRaw<Array<{ position: number }>>`
        WITH ranked_users AS (
          SELECT 
            id,
            ROW_NUMBER() OVER (
              ORDER BY level DESC, elo DESC
            ) as position
          FROM "users"
          WHERE "isActive" = true
        )
        SELECT position::int
        FROM ranked_users 
        WHERE id = ${userId}
      `,

      // Total de usuarios activos
      prisma.user.count({
        where: { isActive: true },
      }),

      // Desafíos activos
      prisma.challenge.count({
        where: {
          OR: [{ challengerId: userId }, { challengedId: userId }],
          status: 'ACCEPTED',
        },
      }),

      // Desafíos pendientes donde el usuario es desafiado
      prisma.challenge.count({
        where: {
          challengedId: userId,
          status: 'PENDING',
        },
      }),

      // Últimos 5 matches para forma reciente
      prisma.match.findMany({
        where: {
          OR: [{ winnerId: userId }, { loserId: userId }],
        },
        select: {
          winnerId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Matches del mes actual
      prisma.match.count({
        where: {
          OR: [{ winnerId: userId }, { loserId: userId }],
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999),
          },
        },
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Calcular forma reciente
    const recentForm = recentMatches.map(match => (match.winnerId === userId ? 'W' : 'L')) as (
      | 'W'
      | 'L'
    )[]

    // Calcular días en el nivel actual
    const levelDays = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    const userStats = {
      currentPosition: userPosition[0]?.position || 0,
      totalPlayers: totalUsers,
      winRate: user.totalMatches > 0 ? (user.wins / user.totalMatches) * 100 : 0,
      totalMatches: user.totalMatches,
      currentStreak: user.streak,
      recentForm,
      level: user.level,
      levelDays,
      promotions: user.promotions,
      demotions: user.demotions,
      monthlyMatches,
      activeChallenges,
      pendingChallenges,
    }

    return NextResponse.json({
      stats: userStats,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
