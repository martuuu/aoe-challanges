import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ChallengeStatus, ChallengeType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const recent = searchParams.get('recent')

    const whereClause: {
      status?: ChallengeStatus | { in: ChallengeStatus[] }
      OR?: Array<{ challengerId: string } | { challengedId: string } | { type: ChallengeType }>
      expiresAt?: { gte: Date }
    } = {}

    // Filtros específicos
    if (status) {
      if (status === 'pending') {
        // Para status=pending, necesitamos challenges que aún necesitan confirmación
        // Esto incluye tanto PENDING como challenges que aún no están completamente aceptados
        whereClause.status = { in: ['PENDING'] as ChallengeStatus[] }
        // Excluir challenges expirados
        whereClause.expiresAt = { gte: new Date() }
      } else {
        whereClause.status = status.toUpperCase() as ChallengeStatus
      }
    }

    if (userId) {
      if (status === 'pending') {
        // Para challenges pendientes, mostrar TODOS los challenges pendientes para que todos puedan ver quién desafió a quién
        // No aplicar filtro por userId para status=pending
      } else {
        // Para otros status (accepted, completed, etc.), solo mostrar los que involucran al usuario
        whereClause.OR = [
          { challengerId: userId }, // Usuario es el desafiante
          { challengedId: userId }, // Usuario es el desafiado
          { type: 'SUGGESTION' as ChallengeType }, // Todas las sugerencias
        ]
      }
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
