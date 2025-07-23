import { NextResponse } from 'next/server'
import { userService } from '@/lib/services/user-service'

export async function GET() {
  try {
    const users = await userService.getAllUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
