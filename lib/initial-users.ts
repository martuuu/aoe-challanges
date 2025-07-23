// Datos iniciales de usuarios con contraseñas generadas
export interface User {
  id: number
  name: string
  email: string
  alias: string
  password: string
  level: number
  elo: number
  wins: number
  losses: number
  streak: number
  created_at: string
}

// Genera contraseñas usando alias + número de ID
const generatePassword = (alias: string, id: number): string => {
  return `${alias.toLowerCase()}${id}`
}

export const initialUsers: User[] = [
  {
    id: 1,
    name: 'Bicho',
    email: 'garciagamero.r@hotmail.com',
    alias: 'Bicho',
    password: generatePassword('Bicho', 1),
    level: 3,
    elo: 1200, // ELO base para nivel 3
    wins: 0,
    losses: 0,
    streak: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Tata',
    email: 'martin.decharras@gmail.com',
    alias: 'Tata',
    password: generatePassword('Tata', 2),
    level: 3,
    elo: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Seba',
    email: 'seba.noe@hotmail.com',
    alias: 'Seba',
    password: generatePassword('Seba', 3),
    level: 3,
    elo: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Dany',
    email: 'daniel_dannunzio@hotmail.com',
    alias: 'Dany',
    password: generatePassword('Dany', 4),
    level: 3,
    elo: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Chaquinha',
    email: 'n.franco@hotmail.es',
    alias: 'Chaquinha',
    password: generatePassword('Chaquinha', 5),
    level: 3,
    elo: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Mati',
    email: 'ml.matias@hotmail.com',
    alias: 'Mati',
    password: generatePassword('Mati', 6),
    level: 3,
    elo: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 7,
    name: 'Pana',
    email: 'facundo_mena@hotmail.com',
    alias: 'Pana',
    password: generatePassword('Pana', 7),
    level: 3,
    elo: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 8,
    name: 'Ruso',
    email: 'nicolas.h.dobler@gmail.com',
    alias: 'Ruso',
    password: generatePassword('Ruso', 8),
    level: 3,
    elo: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 9,
    name: 'Tincho',
    email: 'olimpomn@hotmail.com',
    alias: 'Tincho',
    password: generatePassword('Tincho', 9),
    level: 3,
    elo: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
    created_at: new Date().toISOString(),
  },
]

// Configuración de niveles y ELO
export const LEVEL_CONFIG = {
  1: { name: 'El lechero', minElo: 1400, maxPlayers: 1 },
  2: { name: 'Protesis Ok', minElo: 1300, maxPlayers: 2 },
  3: { name: 'Construyo mas atras', minElo: 1100, maxPlayers: 4 },
  4: { name: 'manco juga a otra cosa', minElo: 0, maxPlayers: 10 },
}

// Exportar contraseñas para referencia (remover en producción)
export const passwordReference = initialUsers.map(user => ({
  name: user.name,
  email: user.email,
  password: user.password,
}))
