import { NextRequest, NextResponse } from 'next/server'
import { challengeService } from '@/lib/services/challenge-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { challengerId, challengedId, type } = body

    console.log('Creating challenge with data:', { challengerId, challengedId, type })

    if (!challengerId || !challengedId) {
      return NextResponse.json(
        { error: 'challengerId y challengedId son requeridos' },
        { status: 400 }
      )
    }

    const challenge = await challengeService.createChallenge({
      challengerId,
      challengedId,
      type: type || 'INDIVIDUAL',
    })

    console.log('Challenge created successfully:', challenge.id)
    return NextResponse.json({ challenge, success: true })
  } catch (error) {
    console.error('Error creando desafío:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available')
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const challenges = await challengeService.getPendingChallenges()
    return NextResponse.json({ challenges })
  } catch (error) {
    console.error('Error obteniendo desafíos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
