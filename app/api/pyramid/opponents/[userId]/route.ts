import { NextRequest, NextResponse } from 'next/server'
import { pyramidService } from '@/lib/services/pyramid-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const opponents = await pyramidService.getAvailableOpponents(userId)
    return NextResponse.json(opponents)
  } catch (error) {
    console.error('Error obteniendo oponentes disponibles:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
