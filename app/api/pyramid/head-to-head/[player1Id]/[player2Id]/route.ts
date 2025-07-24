import { NextRequest, NextResponse } from 'next/server'
import { pyramidService } from '@/lib/services/pyramid-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ player1Id: string; player2Id: string }> }
) {
  try {
    const { player1Id, player2Id } = await params
    const stats = await pyramidService.getHeadToHeadStats(player1Id, player2Id)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error obteniendo estadísticas head-to-head:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
