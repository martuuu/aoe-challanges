import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Traer todos los datos necesarios para estadísticas en una sola consulta
    const [users, matches, challenges] = await Promise.all([
      // Usuarios con toda su información
      prisma.user.findMany({
        select: {
          id: true,
          alias: true,
          level: true,
          elo: true,
          wins: true,
          losses: true,
          streak: true,
          bestStreak: true,
          totalMatches: true,
          promotions: true,
          demotions: true,
          createdAt: true,
          lastActiveAt: true,
        },
      }),

      // Matches con información completa
      prisma.match.findMany({
        include: {
          winner: {
            select: {
              id: true,
              alias: true,
            },
          },
          loser: {
            select: {
              id: true,
              alias: true,
            },
          },
          challenge: {
            select: {
              id: true,
              challengerId: true,
              challengedId: true,
              type: true,
            },
          },
          groupMatch: {
            include: {
              participants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      alias: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      // Challenges con información completa
      prisma.challenge.findMany({
        include: {
          challenger: {
            select: {
              id: true,
              alias: true,
            },
          },
          challenged: {
            select: {
              id: true,
              alias: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    return NextResponse.json({
      users,
      matches,
      challenges,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching all stats data:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
