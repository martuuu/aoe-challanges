import { NextRequest, NextResponse } from 'next/server'
import { matchService } from '@/lib/services/match-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { team1, team2, winner } = body

    if (!team1 || !team2 || !winner) {
      return NextResponse.json({ error: 'team1, team2 y winner son requeridos' }, { status: 400 })
    }

    if (!Array.isArray(team1) || !Array.isArray(team2)) {
      return NextResponse.json({ error: 'team1 y team2 deben ser arrays' }, { status: 400 })
    }

    if (winner !== 'team1' && winner !== 'team2') {
      return NextResponse.json({ error: 'winner debe ser "team1" o "team2"' }, { status: 400 })
    }

    const match = await matchService.createGroupMatch({
      team1,
      team2,
      winner,
    })

    return NextResponse.json({ match, success: true })
  } catch (error) {
    console.error('Error creando match grupal:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recent = searchParams.get('recent')

    const matches = await matchService.getRecentMatches(recent ? parseInt(recent) : undefined)
    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Error obteniendo matches:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
