import { NextRequest, NextResponse } from 'next/server'
import { pyramidService } from '@/lib/services/pyramid-service'

export async function POST(request: NextRequest) {
  try {
    const { challengerId, challengedId } = await request.json()

    if (!challengerId || !challengedId) {
      return NextResponse.json(
        { error: 'challengerId y challengedId son requeridos' },
        { status: 400 }
      )
    }

    const result = await pyramidService.canChallenge(challengerId, challengedId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error validando desafío:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
