import { prisma } from './lib/prisma'

async function checkUserLevels() {
  try {
    console.log('🔍 Verificando niveles de usuarios después del reset...')
    const users = await prisma.user.findMany({
      select: {
        alias: true,
        level: true,
      },
      orderBy: {
        alias: 'asc',
      },
    })

    console.log('Usuarios y sus niveles:')
    users.forEach(user => {
      console.log(`${user.alias}: Nivel ${user.level}`)
    })

    const level4Count = users.filter(u => u.level === 4).length
    console.log(`\n✅ ${level4Count}/${users.length} usuarios están en nivel 4 (nivel 0)`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserLevels()
