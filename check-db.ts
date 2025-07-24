import { prisma } from './lib/prisma'

async function checkDatabase() {
  try {
    console.log('🔍 Verificando usuarios...')
    const users = await prisma.user.findMany({
      where: {
        alias: {
          in: ['Tincho', 'Tata'],
        },
      },
      select: {
        id: true,
        alias: true,
        email: true,
      },
    })

    console.log('Usuarios encontrados:', users)

    console.log('\n🔍 Verificando challenges...')
    const challenges = await prisma.challenge.findMany({
      include: {
        challenger: {
          select: {
            alias: true,
          },
        },
        challenged: {
          select: {
            alias: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    console.log('Challenges encontrados:', challenges)

    if (challenges.length === 0) {
      console.log('No hay challenges en la base de datos')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
