import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email y contraseña son requeridos',
        },
        { status: 400 }
      )
    }

    const result = await authService.login({ email, password })

    return NextResponse.json({
      success: true,
      user: result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error de autenticación',
      },
      { status: 401 }
    )
  }
}
