import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AppState, AppLoadingState, AppErrorState, AppCacheTimestamps } from './types'
import { PyramidData } from '../hooks/usePyramid'

// Initial states
const initialLoadingState: AppLoadingState = {
  users: false,
  pyramid: false,
  challenges: false,
  matches: false,
  stats: false,
}

const initialErrorState: AppErrorState = {
  users: null,
  pyramid: null,
  challenges: null,
  matches: null,
  stats: null,
}

const initialCacheTimestamps: AppCacheTimestamps = {
  users: 0,
  pyramid: 0,
  challenges: 0,
  matches: 0,
  stats: 0,
}

const initialPyramidData: PyramidData = {
  1: [],
  2: [],
  3: [],
  4: [],
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial State
      users: [],
      pyramidData: initialPyramidData,
      pendingChallenges: [],
      recentMatches: [],
      recentChallenges: [],
      monthlyStats: null,
      userMainStats: {},
      isLoading: initialLoadingState,
      errors: initialErrorState,
      lastUpdated: initialCacheTimestamps,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes

      // Cache Management
      shouldRefetch: key => {
        const { lastUpdated, cacheTimeout } = get()
        const now = Date.now()
        return now - lastUpdated[key] > cacheTimeout
      },

      invalidateCache: key => {
        set(state => ({
          lastUpdated: {
            ...state.lastUpdated,
            [key]: 0,
          },
        }))
      },

      clearErrors: () => {
        set({ errors: initialErrorState })
      },

      // Fetch Users
      fetchUsers: async () => {
        const { shouldRefetch } = get()
        if (!shouldRefetch('users')) return

        set(state => ({
          isLoading: { ...state.isLoading, users: true },
          errors: { ...state.errors, users: null },
        }))

        try {
          const response = await fetch('/api/users')
          if (!response.ok) throw new Error('Failed to fetch users')

          const users = await response.json()

          set(state => ({
            users,
            isLoading: { ...state.isLoading, users: false },
            lastUpdated: { ...state.lastUpdated, users: Date.now() },
          }))
        } catch (error) {
          set(state => ({
            isLoading: { ...state.isLoading, users: false },
            errors: {
              ...state.errors,
              users: error instanceof Error ? error.message : 'Error loading users',
            },
          }))
        }
      },

      // Fetch Pyramid Data
      fetchPyramidData: async () => {
        const { shouldRefetch } = get()
        if (!shouldRefetch('pyramid')) return

        set(state => ({
          isLoading: { ...state.isLoading, pyramid: true },
          errors: { ...state.errors, pyramid: null },
        }))

        try {
          const response = await fetch('/api/pyramid')
          if (!response.ok) throw new Error('Failed to fetch pyramid data')

          const pyramidData = await response.json()

          set(state => ({
            pyramidData,
            isLoading: { ...state.isLoading, pyramid: false },
            lastUpdated: { ...state.lastUpdated, pyramid: Date.now() },
          }))
        } catch (error) {
          set(state => ({
            isLoading: { ...state.isLoading, pyramid: false },
            errors: {
              ...state.errors,
              pyramid: error instanceof Error ? error.message : 'Error loading pyramid',
            },
          }))
        }
      },

      // Fetch Pending Challenges
      fetchPendingChallenges: async userId => {
        const { shouldRefetch } = get()
        if (!shouldRefetch('challenges')) return

        set(state => ({
          isLoading: { ...state.isLoading, challenges: true },
          errors: { ...state.errors, challenges: null },
        }))

        try {
          const url = userId
            ? `/api/challenges-optimized?status=pending&userId=${userId}`
            : '/api/challenges-optimized?status=pending'

          const response = await fetch(url)
          if (!response.ok) throw new Error('Failed to fetch pending challenges')

          const data = await response.json()

          set(state => ({
            pendingChallenges: data.challenges || [],
            isLoading: { ...state.isLoading, challenges: false },
            lastUpdated: { ...state.lastUpdated, challenges: Date.now() },
          }))
        } catch (error) {
          set(state => ({
            isLoading: { ...state.isLoading, challenges: false },
            errors: {
              ...state.errors,
              challenges: error instanceof Error ? error.message : 'Error loading challenges',
            },
          }))
        }
      },

      // Fetch Recent History
      fetchRecentHistory: async () => {
        const { shouldRefetch } = get()
        if (!shouldRefetch('matches')) return

        set(state => ({
          isLoading: { ...state.isLoading, matches: true },
          errors: { ...state.errors, matches: null },
        }))

        try {
          // Get recent matches
          const matchesResponse = await fetch('/api/matches?recent=10')
          if (!matchesResponse.ok) throw new Error('Failed to fetch recent matches')
          const matchesData = await matchesResponse.json()

          // Get recent challenges
          const challengesResponse = await fetch('/api/challenges-optimized?recent=10')
          if (!challengesResponse.ok) throw new Error('Failed to fetch recent challenges')
          const challengesData = await challengesResponse.json()

          set(state => ({
            recentMatches: matchesData.matches || [],
            recentChallenges: challengesData.challenges || [],
            isLoading: { ...state.isLoading, matches: false },
            lastUpdated: { ...state.lastUpdated, matches: Date.now() },
          }))
        } catch (error) {
          set(state => ({
            isLoading: { ...state.isLoading, matches: false },
            errors: {
              ...state.errors,
              matches: error instanceof Error ? error.message : 'Error loading recent history',
            },
          }))
        }
      },

      // Fetch Monthly Stats
      fetchMonthlyStats: async () => {
        const { shouldRefetch } = get()
        if (!shouldRefetch('stats')) return

        set(state => ({
          isLoading: { ...state.isLoading, stats: true },
          errors: { ...state.errors, stats: null },
        }))

        try {
          const response = await fetch('/api/stats/monthly-optimized')
          if (!response.ok) throw new Error('Failed to fetch monthly stats')

          const data = await response.json()

          set(state => ({
            monthlyStats: data.stats,
            isLoading: { ...state.isLoading, stats: false },
            lastUpdated: { ...state.lastUpdated, stats: Date.now() },
          }))
        } catch (error) {
          set(state => ({
            isLoading: { ...state.isLoading, stats: false },
            errors: {
              ...state.errors,
              stats: error instanceof Error ? error.message : 'Error loading monthly stats',
            },
          }))
        }
      },

      // Fetch User Main Stats
      fetchUserMainStats: async userId => {
        set(state => ({
          isLoading: { ...state.isLoading, stats: true },
          errors: { ...state.errors, stats: null },
        }))

        try {
          const response = await fetch(`/api/stats/user-main-optimized?userId=${userId}`)
          if (!response.ok) throw new Error('Failed to fetch user stats')

          const data = await response.json()

          set(state => ({
            userMainStats: {
              ...state.userMainStats,
              [userId]: data.stats,
            },
            isLoading: { ...state.isLoading, stats: false },
          }))
        } catch (error) {
          set(state => ({
            isLoading: { ...state.isLoading, stats: false },
            errors: {
              ...state.errors,
              stats: error instanceof Error ? error.message : 'Error loading user stats',
            },
          }))
        }
      },

      // Fetch Initial Data
      fetchInitialData: async () => {
        const { fetchUsers, fetchPyramidData, fetchMonthlyStats, fetchRecentHistory } = get()

        await Promise.allSettled([
          fetchUsers(),
          fetchPyramidData(),
          fetchMonthlyStats(),
          fetchRecentHistory(),
        ])
      },

      // Mutations
      updateUser: user => {
        set(state => ({
          users: state.users.map(u => (u.id === user.id ? user : u)),
        }))
      },

      addMatch: _match => {
        // For now, just invalidate cache to trigger refetch
        const { invalidateCache } = get()
        invalidateCache('matches')
        invalidateCache('pyramid')
        invalidateCache('stats')
      },

      updateChallenge: _challenge => {
        // For now, just invalidate cache to trigger refetch
        const { invalidateCache } = get()
        invalidateCache('challenges')
      },

      // Optimistic Updates
      optimisticMatchUpdate: matchUpdate => {
        // This will be implemented when we need optimistic updates
        console.log('Optimistic match update:', matchUpdate)
      },

      optimisticChallengeUpdate: challengeUpdate => {
        // This will be implemented when we need optimistic updates
        console.log('Optimistic challenge update:', challengeUpdate)
      },
    }),
    {
      name: 'app-store',
    }
  )
)

// Selectors for performance
export const useUsers = () => useAppStore(state => state.users)
export const usePyramidData = () => useAppStore(state => state.pyramidData)
export const usePendingChallenges = () => useAppStore(state => state.pendingChallenges)
export const useRecentMatches = () => useAppStore(state => state.recentMatches)
export const useRecentChallenges = () => useAppStore(state => state.recentChallenges)
export const useMonthlyStats = () => useAppStore(state => state.monthlyStats)
export const useUserMainStats = (userId: string) =>
  useAppStore(state => state.userMainStats[userId])

// Loading selectors
export const useIsLoading = () => useAppStore(state => state.isLoading)
export const useErrors = () => useAppStore(state => state.errors)

// Action selectors - Using individual selectors to avoid recreation
export const useFetchInitialData = () => useAppStore(state => state.fetchInitialData)
export const useFetchUsers = () => useAppStore(state => state.fetchUsers)
export const useFetchPyramidData = () => useAppStore(state => state.fetchPyramidData)
export const useFetchPendingChallenges = () => useAppStore(state => state.fetchPendingChallenges)
export const useFetchRecentHistory = () => useAppStore(state => state.fetchRecentHistory)
export const useFetchMonthlyStats = () => useAppStore(state => state.fetchMonthlyStats)
export const useFetchUserMainStats = () => useAppStore(state => state.fetchUserMainStats)
export const useUpdateUser = () => useAppStore(state => state.updateUser)
export const useAddMatch = () => useAppStore(state => state.addMatch)
export const useUpdateChallenge = () => useAppStore(state => state.updateChallenge)
export const useInvalidateCache = () => useAppStore(state => state.invalidateCache)
export const useClearErrors = () => useAppStore(state => state.clearErrors)
