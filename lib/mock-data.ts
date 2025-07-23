// Datos temporales para desarrollo mientras solucionamos la conexión a Supabase

export const mockData = {
  // Usuarios mock
  users: [
    { id: '1', alias: 'Bicho', level: 3 },
    { id: '2', alias: 'Tata', level: 3 },
    { id: '3', alias: 'Seba', level: 3 },
    { id: '4', alias: 'Dany', level: 3 },
    { id: '5', alias: 'Chaquinha', level: 3 },
    { id: '6', alias: 'Mati', level: 3 },
    { id: '7', alias: 'Pana', level: 3 },
    { id: '8', alias: 'Ruso', level: 3 },
    { id: '9', alias: 'Tincho', level: 3 },
  ],

  // Estadísticas del mes mock
  monthStats: {
    topWinner: { name: 'Bicho', wins: 8 },
    topLoser: { name: 'Mati', losses: 6 },
    bestStreak: { name: 'Ruso', streak: 4 },
    mostClimbed: { name: 'Tincho', positions: 2 },
  },

  // Desafíos pendientes mock (formato ChallengesSection)
  pendingChallenges: [
    {
      id: '1',
      challenger: 'Dany',
      challenged: 'Pana',
      status: 'pending' as const,
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    },
  ],

  // Desafíos aceptados mock (formato HistorySection)
  acceptedChallenges: [
    {
      id: '2',
      challenger: { alias: 'Bicho' },
      challenged: { alias: 'Tincho' },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
    },
  ],

  // Historial de desafíos mock
  recentChallenges: [
    {
      id: '3',
      challenger: 'Chino',
      challenged: 'Ruso',
      status: 'completed' as const,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      winner: 'Chino',
    },
  ],

  // Matches recientes mock
  recentMatches: [
    {
      id: '1',
      winner: 'Chino',
      loser: 'Ruso',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      type: 'challenge' as const,
    },
    {
      id: '2',
      winner: '',
      loser: '',
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      type: 'group' as const,
      team1: ['Tincho', 'Pana'],
      team2: ['Dany', 'Bicho'],
      winning_team: 'team1' as const,
    },
  ],
}
