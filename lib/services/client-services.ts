// Servicios del lado del cliente que usan las API routes

export const clientUserService = {
  // Obtener todos los usuarios
  async getAllUsers() {
    const response = await fetch('/api/users')

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error obteniendo usuarios')
    }

    const data = await response.json()
    return data.users
  },
}

export const clientChallengeService = {
  // Crear un nuevo desafío
  async createChallenge(data: { challengerId: string; challengedId: string; type?: string }) {
    const response = await fetch('/api/challenges/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error creando desafío')
    }

    return await response.json()
  },

  // Aceptar un desafío
  async acceptChallenge(challengeId: string) {
    const response = await fetch(`/api/challenges/${challengeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'accept' }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error aceptando desafío')
    }

    return await response.json()
  },

  // Rechazar un desafío
  async rejectChallenge(challengeId: string, reason?: string) {
    const response = await fetch(`/api/challenges/${challengeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'reject', reason }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error rechazando desafío')
    }

    return await response.json()
  },

  // Completar un desafío
  async completeChallenge(challengeId: string, winnerId: string) {
    const response = await fetch(`/api/challenges/${challengeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'complete', winnerId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error completando desafío')
    }

    return await response.json()
  },
}

export const clientMatchService = {
  // Crear un match grupal
  async createGroupMatch(data: { team1: string[]; team2: string[]; winner: 'team1' | 'team2' }) {
    const response = await fetch('/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error creando match grupal')
    }

    return await response.json()
  },
}
