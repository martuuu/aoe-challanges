import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Probar la conexión con una consulta simple
    const userCount = await prisma.user.count()

    // Probar también obtener algunos usuarios
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        alias: true,
        email: true,
      },
    })

    return NextResponse.json({
      success: true,
      connection: 'OK',
      userCount,
      sampleUsers: users,
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      },
      { status: 500 }
    )
  }
}
