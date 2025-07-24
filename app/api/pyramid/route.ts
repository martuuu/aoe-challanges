import { NextResponse } from 'next/server'
import { userService } from '@/lib/services/user-service'

export async function GET() {
  try {
    const pyramidData = await userService.getPyramidData()
    return NextResponse.json(pyramidData)
  } catch (error) {
    console.error('Error obteniendo datos de la pirámide:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
