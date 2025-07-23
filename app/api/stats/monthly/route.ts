import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Por ahora devolvemos estadísticas mock
    // Puedes implementar la lógica real más tarde
    const monthStats = {
      totalMatches: 45,
      totalChallenges: 23,
      averageMatchDuration: 28,
      mostActivePlayer: 'Bicho',
      winRate: 67,
      totalHours: 21,
    }

    return NextResponse.json({ monthStats })
  } catch (error) {
    console.error('Error obteniendo estadísticas mensuales:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
