import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { initialUsers } from '../lib/initial-users'

const prisma = new PrismaClient()

async function main() {
  // Limpiar datos existentes
  await prisma.groupMatchParticipant.deleteMany()
  await prisma.groupMatch.deleteMany()
  await prisma.levelChange.deleteMany()
  await prisma.eloHistory.deleteMany()
  await prisma.match.deleteMany()
  await prisma.challenge.deleteMany()
  await prisma.user.deleteMany()

  for (const userData of initialUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        alias: userData.alias,
        password: hashedPassword,
        level: userData.level,
        elo: userData.elo,
        wins: userData.wins,
        losses: userData.losses,
        streak: userData.streak,
        totalMatches: userData.wins + userData.losses,
      },
    })

    console.log(
      `Created user: ${user.name} (${user.alias}) - Email: ${user.email} - Password: ${userData.password}`
    )
  }

  // Crear algunos desafíos de ejemplo
  const users = await prisma.user.findMany()
  console.log(`Created ${users.length} users total`)

  if (users.length >= 2) {
    console.log('Skipping sample challenges creation...')
    // Comentado para empezar con base de datos limpia
    /*
    await prisma.challenge.create({
      data: {
        challengerId: users[0].id,
        challengedId: users[1].id,
        status: 'PENDING',
        type: 'INDIVIDUAL',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
      },
    })

    await prisma.challenge.create({
      data: {
        challengerId: users[1].id,
        challengedId: users[2] ? users[2].id : users[0].id,
        status: 'PENDING',
        type: 'SUGGESTION',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
      },
    })
    */

    console.log('Database ready for clean start')
  }

  console.log('Database seeded successfully!')

  // Mostrar resumen de contraseñas
  console.log('')
  console.log('User Credentials Summary:')
  console.log('================================')
  for (const userData of initialUsers) {
    console.log(`${userData.name} (${userData.alias}): ${userData.password}`)
  }
  console.log('================================')
  console.log('')
}

main()
  .catch(e => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
