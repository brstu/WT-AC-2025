import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const programsApi = createApi({
  reducerPath: 'programsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  tagTypes: ['Programs', 'Program'],
  endpoints: (builder) => ({
    getPrograms: builder.query({
      query: () => '/programs',
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: 'Program', id: String(p.id) })),
              { type: 'Programs', id: 'LIST' },
            ]
          : [{ type: 'Programs', id: 'LIST' }],
    }),

    getProgramById: builder.query({
      query: (id) => `/programs/${id}`,
      providesTags: (result, err, id) => [{ type: 'Program', id: String(id) }],
    }),

    createProgram: builder.mutation({
      query: (body) => ({
        url: '/programs',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Programs', id: 'LIST' }],
    }),

    updateProgram: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/programs/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (r, e, arg) => [
        { type: 'Program', id: String(arg.id) },
        { type: 'Programs', id: 'LIST' },
      ],
    }),

    deleteProgram: builder.mutation({
      query: (id) => ({
        url: `/programs/${id}`,
        method: 'DELETE',
      }),
      // пример optimistic update (быстро скрываем из списка)
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          programsApi.util.updateQueryData('getPrograms', undefined, (draft) => {
            const idx = draft.findIndex((p) => String(p.id) === String(id))
            if (idx >= 0) draft.splice(idx, 1)
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: [{ type: 'Programs', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetProgramsQuery,
  useGetProgramByIdQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
} = programsApi