import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../../../store';

export interface Game {
  id: string;
  title: string;
  genre: string;
  platform: string;
  releaseYear: number;
  developer: string;
  publisher: string;
  rating: number;
  description: string;
  imageUrl?: string;
  price?: number;
  status: 'available' | 'coming-soon' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

export interface GamesListResponse {
  data: Game[];
  total: number;
  page: number;
  limit: number;
}

export interface GamesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL as string,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const gamesApi = createApi({
  reducerPath: 'gamesApi',
  baseQuery,
  tagTypes: ['Game'],
  endpoints: (builder) => ({
    getGamesList: builder.query<GamesListResponse, GamesQueryParams>({
      query: ({ page = 1, limit = 10, search = '' } = {}) => ({
        url: '/games',
        params: { page, limit, search },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Game' as const, id })),
              { type: 'Game' as const, id: 'LIST' },
            ]
          : [{ type: 'Game' as const, id: 'LIST' }],
    }),
    getGameById: builder.query<Game, string>({
      query: (id) => `/games/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Game', id }],
    }),
    createGame: builder.mutation<Game, Partial<Game>>({
      query: (game) => ({
        url: '/games',
        method: 'POST',
        body: game,
      }),
      invalidatesTags: [{ type: 'Game', id: 'LIST' }],
      async onQueryStarted(_game, { dispatch, queryFulfilled }) {
        try {
          const { data: newGame } = await queryFulfilled;
          // Optimistic update
          dispatch(
            gamesApi.util.updateQueryData('getGamesList', {}, (draft) => {
              draft.data.unshift(newGame);
            })
          );
        } catch {
          // Rollback optimistic update on error
        }
      },
    }),
    updateGame: builder.mutation<Game, Partial<Game> & { id: string }>({
      query: ({ id, ...game }) => ({
        url: `/games/${id}`,
        method: 'PUT',
        body: game,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Game', id },
        { type: 'Game', id: 'LIST' },
      ],
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          gamesApi.util.updateQueryData('getGameById', id, (draft) => {
            Object.assign(draft, patch);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteGame: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/games/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Game', id },
        { type: 'Game', id: 'LIST' },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          gamesApi.util.updateQueryData('getGamesList', {}, (draft) => {
            const index = draft.data.findIndex((item) => item.id === id);
            if (index !== -1) {
              draft.data.splice(index, 1);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetGamesListQuery,
  useGetGameByIdQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
} = gamesApi;
