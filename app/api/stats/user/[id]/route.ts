import { NextRequest, NextResponse } from 'next/server'
import { challengeService } from '@/lib/services/challenge-service'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario es requerido' }, { status: 400 })
    }

    // Obtener estadísticas de desafíos del usuario
    const challengeStats = await challengeService.getChallengeStats(id)

    return NextResponse.json({
      challengeStats,
      success: true,
    })
  } catch (error) {
    console.error('Error obteniendo estadísticas de usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
