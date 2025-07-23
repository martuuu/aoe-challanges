// ARCHIVO TEMPORAL PARA DESARROLLO
// Este archivo contiene las credenciales de acceso para cada jugador
// En producción, estas contraseñas se enviarán por email a cada jugador

import { passwordReference } from './initial-users'

console.table(passwordReference)

export const showPasswords = () => {
  console.log('\n🎮 CREDENCIALES DE ACCESO AOE PANADEROS 🎮\n')
  console.log('Todos los jugadores empiezan en el nivel 3: "Construyo mas atras"\n')

  passwordReference.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Contraseña: ${user.password}`)
    console.log('')
  })

  console.log('📝 Notas:')
  console.log('- Las contraseñas son: alias + número de ID')
  console.log('- Todos arrancan en nivel 3')
  console.log('- Pueden desafiar a su mismo nivel o 1 nivel superior')
  console.log('- Están obligados a aceptar desafíos de niveles inferiores')
  console.log('')
  console.log('🏆 Sistema de niveles:')
  console.log('1. El lechero (Rey)')
  console.log('2. Protesis Ok')
  console.log('3. Construyo mas atras (Inicial)')
  console.log('4. manco juga a otra cosa')
}

// Llamar la función para mostrar las contraseñas en consola
if (typeof window !== 'undefined') {
  showPasswords()
}
