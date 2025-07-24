import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()


    const result = await authService.login({ email, password })


    return NextResponse.json({
      success: true,
      user: result,
    })
  } catch (error) {
    console.error('❌ Test login falló:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 401 }
    )
  }
}
