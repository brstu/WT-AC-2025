import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { mockGames } from './mockData'

// Функция для имитации задержки сети
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Генератор ID для новых игр
let nextId = Math.max(...mockGames.map(game => game.id)) + 1

export const gamesApi = createApi({
  reducerPath: 'gamesApi',
  tagTypes: ['Game'],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getGames: builder.query({
      queryFn: async () => {
        await delay(500)
        return { data: [...mockGames] }
      },
      providesTags: ['Game'],
    }),

    getGame: builder.query({
      queryFn: async (id) => {
        await delay(300)
        const game = mockGames.find(game => game.id === parseInt(id))
        if (!game) {
          return { error: { status: 404, data: 'Игра не найдена' } }
        }
        return { data: game }
      },
      providesTags: (result, error, id) => [{ type: 'Game', id }],
    }),

    createGame: builder.mutation({
      queryFn: async (gameData) => {
        await delay(400)
        const newGame = {
          id: nextId++,
          ...gameData,
          createdAt: new Date().toISOString()
        }
        mockGames.push(newGame)
        return { data: newGame }
      },
      invalidatesTags: ['Game'],
    }),

    updateGame: builder.mutation({
      queryFn: async ({ id, gameData }) => {
        await delay(400)
        const index = mockGames.findIndex(game => game.id === parseInt(id))
        if (index === -1) {
          return { error: { status: 404, data: 'Игра не найдена' } }
        }
        mockGames[index] = { ...mockGames[index], ...gameData }
        return { data: mockGames[index] }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Game', id }],
    }),

    deleteGame: builder.mutation({
      queryFn: async (id) => {
        await delay(300)
        const index = mockGames.findIndex(game => game.id === parseInt(id))
        if (index === -1) {
          return { error: { status: 404, data: 'Игра не найдена' } }
        }
        mockGames.splice(index, 1)
        return { data: { success: true } }
      },
      invalidatesTags: ['Game'],
    }),
  }),
})

export const {
  useGetGamesQuery,
  useGetGameQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
} = gamesApi