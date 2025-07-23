import { NextRequest, NextResponse } from 'next/server'
import { challengeService } from '@/lib/services/challenge-service'

export async function POST(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { action, winnerId, reason } = body

    if (!id) {
      return NextResponse.json({ error: 'ID del desafío es requerido' }, { status: 400 })
    }

    let result
    switch (action) {
      case 'accept':
        result = await challengeService.acceptChallenge(id)
        break
      case 'reject':
        result = await challengeService.rejectChallenge(id, reason)
        break
      case 'complete':
        if (!winnerId) {
          return NextResponse.json(
            { error: 'winnerId es requerido para completar el desafío' },
            { status: 400 }
          )
        }
        result = await challengeService.completeChallenge(id, winnerId)
        break
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }

    return NextResponse.json({ challenge: result, success: true })
  } catch (error) {
    console.error('Error procesando desafío:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
