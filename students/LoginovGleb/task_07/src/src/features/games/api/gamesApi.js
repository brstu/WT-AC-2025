import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
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
    getGamesList: builder.query({
      query: ({ page = 1, limit = 10, search = '' }) => ({
        url: '/games',
        params: { page, limit, search },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Game', id })),
              { type: 'Game', id: 'LIST' },
            ]
          : [{ type: 'Game', id: 'LIST' }],
    }),
    getGameById: builder.query({
      query: (id) => `/games/${id}`,
      providesTags: (result, error, id) => [{ type: 'Game', id }],
    }),
    createGame: builder.mutation({
      query: (game) => ({
        url: '/games',
        method: 'POST',
        body: game,
      }),
      invalidatesTags: [{ type: 'Game', id: 'LIST' }],
      async onQueryStarted(game, { dispatch, queryFulfilled }) {
        try {
          const { data: newGame } = await queryFulfilled;
          // Optimistic update
          dispatch(
            gamesApi.util.updateQueryData('getGamesList', {}, (draft) => {
              draft.data.unshift(newGame);
            })
          );
        } catch {}
      },
    }),
    updateGame: builder.mutation({
      query: ({ id, ...game }) => ({
        url: `/games/${id}`,
        method: 'PUT',
        body: game,
      }),
      invalidatesTags: (result, error, { id }) => [
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
    deleteGame: builder.mutation({
      query: (id) => ({
        url: `/games/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
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
  usePrefetch,
} = gamesApi;
