import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const user = await authService.validateCurrentUser(userId)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado o inactivo',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
