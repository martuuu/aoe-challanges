import { NextRequest, NextResponse } from 'next/server'
import { challengeService } from '@/lib/services/challenge-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { challengerId, challengedId, type } = body

    console.log('=== API CHALLENGE POST ===')
    console.log('Request body completo:', JSON.stringify(body, null, 2))
    console.log('challengerId:', challengerId)
    console.log('challengedId:', challengedId)
    console.log('type:', type)

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
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recent = searchParams.get('recent')

    if (recent) {
      // Obtener challenges recientes
      const challenges = await challengeService.getRecentChallenges(parseInt(recent))
      return NextResponse.json({ challenges })
    } else {
      // Obtener solo challenges pendientes
      const challenges = await challengeService.getPendingChallenges()
      return NextResponse.json({ challenges })
    }
  } catch (error) {
    console.error('Error obteniendo desafíos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { challengeId, userId, action } = body

    console.log('Updating challenge player status:', { challengeId, userId, action })

    if (!challengeId || !userId || !action) {
      return NextResponse.json(
        { error: 'challengeId, userId y action son requeridos' },
        { status: 400 }
      )
    }

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json({ error: 'action debe ser "accept" o "reject"' }, { status: 400 })
    }

    const status = action === 'accept' ? 'ACCEPTED' : 'REJECTED'
    const challenge = await challengeService.updatePlayerStatus(challengeId, userId, status)

    console.log('Challenge player status updated successfully:', challenge.id)
    return NextResponse.json({ challenge, success: true })
  } catch (error) {
    console.error('Error actualizando estado del jugador en desafío:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
