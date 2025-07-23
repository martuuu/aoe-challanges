import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ChallengeStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const recent = searchParams.get('recent')

    const whereClause: {
      status?: ChallengeStatus
      OR?: Array<{ challengerId: string } | { challengedId: string }>
    } = {}

    // Filtros específicos
    if (status) {
      whereClause.status = status.toUpperCase() as ChallengeStatus
    }

    if (userId) {
      whereClause.OR = [{ challengerId: userId }, { challengedId: userId }]
    }

    // Limitar resultados si es "recent"
    const take = recent ? parseInt(recent) : undefined

    const challenges = await prisma.challenge.findMany({
      where: whereClause,
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
      take,
    })

    // Formatear para compatibilidad
    const formattedChallenges = challenges.map(challenge => ({
      id: challenge.id,
      challenger: challenge.challenger.alias,
      challenged: challenge.challenged.alias,
      status: challenge.status.toLowerCase(),
      created_at: challenge.createdAt.toISOString(),
      expires_at: challenge.expiresAt.toISOString(),
      type: challenge.type.toLowerCase(),
      winner: challenge.winnerId,
      challengerStatus: challenge.challengerStatus?.toLowerCase(),
      challengedStatus: challenge.challengedStatus?.toLowerCase(),
    }))

    return NextResponse.json({
      challenges: formattedChallenges,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
