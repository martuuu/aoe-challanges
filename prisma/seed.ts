import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Limpiar datos existentes
  await prisma.groupMatchParticipant.deleteMany()
  await prisma.groupMatch.deleteMany()
  await prisma.levelChange.deleteMany()
  await prisma.eloHistory.deleteMany()
  await prisma.match.deleteMany()
  await prisma.challenge.deleteMany()
  await prisma.user.deleteMany()

  // Crear usuarios de testing
  const testUsers = [
    {
      email: 'olimpomn@hotmail.com',
      name: 'Tincho',
      alias: 'Tincho',
      password: await bcrypt.hash('tincho9', 10),
      level: 3,
      elo: 1200,
    },
    {
      email: 'olimpomn@gmail.com',
      name: 'Martu',
      alias: 'Martu',
      password: await bcrypt.hash('martu10', 10),
      level: 3,
      elo: 1200,
    },
    {
      email: 'test@example.com',
      name: 'TestUser',
      alias: 'Test',
      password: await bcrypt.hash('test11', 10),
      level: 3,
      elo: 1200,
    },
  ]

  for (const userData of testUsers) {
    const user = await prisma.user.create({
      data: userData,
    })
    console.log(`✅ Created user: ${user.name} (${user.email})`)
  }

  // Crear algunos desafíos de ejemplo
  const users = await prisma.user.findMany()

  if (users.length >= 2) {
    await prisma.challenge.create({
      data: {
        challengerId: users[0].id,
        challengedId: users[1].id,
        status: 'PENDING',
        type: 'INDIVIDUAL',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      },
    })

    await prisma.challenge.create({
      data: {
        challengerId: users[1].id,
        challengedId: users[2] ? users[2].id : users[0].id,
        status: 'PENDING',
        type: 'SUGGESTION',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      },
    })

    console.log('✅ Created sample challenges')
  }

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
