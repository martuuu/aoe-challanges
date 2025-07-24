import { NextRequest, NextResponse } from 'next/server'
import { matchService } from '@/lib/services/match-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { winnerId, loserId, challengeId, notes } = body

    if (!winnerId || !loserId) {
      return NextResponse.json({ error: 'winnerId y loserId son requeridos' }, { status: 400 })
    }

    if (winnerId === loserId) {
      return NextResponse.json(
        { error: 'winnerId y loserId no pueden ser iguales' },
        { status: 400 }
      )
    }

    const result = await matchService.createIndividualMatch({
      winnerId,
      loserId,
      challengeId,
      notes,
    })

    return NextResponse.json({
      success: true,
      match: result.match,
      pyramidChanges: result.pyramidChanges,
    })
  } catch (error) {
    console.error('Error creando match individual:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
