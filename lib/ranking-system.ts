import type { User } from './initial-users'

// Sistema ELO y lógica de niveles
export interface MatchResult {
  winnerId: number
  loserId: number
  type: 'challenge' | 'group'
  date: string
}

export interface LevelChange {
  userId: number
  oldLevel: number
  newLevel: number
  reason: string
}

// Calcula el nuevo ELO basado en el resultado del match
export function calculateEloChange(
  winnerElo: number,
  loserElo: number,
  kFactor: number = 32
): { winnerNewElo: number; loserNewElo: number } {
  // Probabilidad esperada de victoria
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400))
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400))

  // Cálculo del nuevo ELO
  const winnerNewElo = Math.round(winnerElo + kFactor * (1 - expectedWinner))
  const loserNewElo = Math.round(loserElo + kFactor * (0 - expectedLoser))

  return { winnerNewElo, loserNewElo }
}

// Determina si un jugador debe cambiar de nivel
export function calculateLevelChange(
  user: User,
  recentMatches: MatchResult[],
  allUsers: User[]
): LevelChange | null {
  const currentLevel = user.level

  // Obtener matches recientes del usuario (últimos 10)
  const userMatches = recentMatches
    .filter(match => match.winnerId === user.id || match.loserId === user.id)
    .slice(-10)

  if (userMatches.length < 2) return null

  // Contar victorias y derrotas por nivel
  const stats = {
    sameLevel: { wins: 0, losses: 0 },
    upperLevel: { wins: 0, losses: 0 },
    lowerLevel: { wins: 0, losses: 0 },
  }

  userMatches.forEach(match => {
    const isWinner = match.winnerId === user.id
    const opponentId = isWinner ? match.loserId : match.winnerId
    const opponent = allUsers.find(u => u.id === opponentId)

    if (!opponent) return

    const levelDiff = opponent.level - currentLevel

    if (levelDiff === 0) {
      // Mismo nivel
      if (isWinner) stats.sameLevel.wins++
      else stats.sameLevel.losses++
    } else if (levelDiff === -1) {
      // Nivel superior (opponent está en nivel inferior)
      if (isWinner) stats.lowerLevel.wins++
      else stats.lowerLevel.losses++
    } else if (levelDiff === 1) {
      // Nivel inferior (opponent está en nivel superior)
      if (isWinner) stats.upperLevel.wins++
      else stats.upperLevel.losses++
    }
  })

  // Reglas de descenso
  if (currentLevel > 1) {
    // 1 derrota contra nivel inferior = descenso
    if (stats.lowerLevel.losses >= 1) {
      return {
        userId: user.id,
        oldLevel: currentLevel,
        newLevel: currentLevel + 1,
        reason: 'Derrota contra nivel inferior',
      }
    }

    // 2 derrotas consecutivas en mismo nivel = descenso
    if (stats.sameLevel.losses >= 2) {
      const lastTwoSameLevel = userMatches
        .filter(match => {
          const opponentId = match.winnerId === user.id ? match.loserId : match.winnerId
          const opponent = allUsers.find(u => u.id === opponentId)
          return opponent && opponent.level === currentLevel
        })
        .slice(-2)

      if (
        lastTwoSameLevel.length === 2 &&
        lastTwoSameLevel.every(match => match.loserId === user.id)
      ) {
        return {
          userId: user.id,
          oldLevel: currentLevel,
          newLevel: currentLevel + 1,
          reason: '2 derrotas consecutivas en mismo nivel',
        }
      }
    }
  }

  // Reglas de ascenso
  if (currentLevel < 4) {
    // 2 victorias en mismo nivel + 1 victoria contra superior = ascenso
    if (stats.sameLevel.wins >= 2 && stats.upperLevel.wins >= 1) {
      return {
        userId: user.id,
        oldLevel: currentLevel,
        newLevel: currentLevel - 1,
        reason: '2 victorias en nivel + 1 victoria contra superior',
      }
    }
  }

  return null
}

// Valida si un desafío es permitido según las reglas
export function canChallenge(challenger: User, challenged: User): boolean {
  const levelDiff = challenged.level - challenger.level

  // Puede desafiar a mismo nivel o 1 nivel superior
  return levelDiff >= 0 && levelDiff <= 1
}

// Calcula estadísticas del jugador
export function calculatePlayerStats(user: User, matches: MatchResult[]) {
  const userMatches = matches.filter(
    match => match.winnerId === user.id || match.loserId === user.id
  )

  const wins = matches.filter(match => match.winnerId === user.id).length
  const losses = matches.filter(match => match.loserId === user.id).length

  // Calcular racha actual
  let currentStreak = 0
  for (let i = userMatches.length - 1; i >= 0; i--) {
    const match = userMatches[i]
    if (match.winnerId === user.id) {
      currentStreak++
    } else {
      break
    }
  }

  return {
    wins,
    losses,
    winRate: wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0,
    currentStreak,
    totalMatches: wins + losses,
  }
}

// Redistribuye jugadores en niveles según ELO
export function redistributeLevels(users: User[]): User[] {
  const sortedByElo = [...users].sort((a, b) => b.elo - a.elo)

  const redistributed = sortedByElo.map((user, index) => {
    let newLevel: number

    if (index === 0) {
      newLevel = 1 // Rey de la pirámide
    } else if (index <= 2) {
      newLevel = 2 // Top 3
    } else if (index <= 5) {
      newLevel = 3 // Medio
    } else {
      newLevel = 4 // Base
    }

    return { ...user, level: newLevel }
  })

  return redistributed
}
