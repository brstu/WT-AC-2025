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

export const equipmentApi = createApi({
  reducerPath: 'equipmentApi',
  baseQuery,
  tagTypes: ['Equipment'],
  endpoints: (builder) => ({
    getEquipmentList: builder.query({
      query: ({ page = 1, limit = 10, search = '' }) => ({
        url: '/equipment',
        params: { page, limit, search },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Equipment', id })),
              { type: 'Equipment', id: 'LIST' },
            ]
          : [{ type: 'Equipment', id: 'LIST' }],
    }),
    getEquipmentById: builder.query({
      query: (id) => `/equipment/${id}`,
      providesTags: (result, error, id) => [{ type: 'Equipment', id }],
    }),
    createEquipment: builder.mutation({
      query: (equipment) => ({
        url: '/equipment',
        method: 'POST',
        body: equipment,
      }),
      invalidatesTags: [{ type: 'Equipment', id: 'LIST' }],
      async onQueryStarted(equipment, { dispatch, queryFulfilled }) {
        try {
          const { data: newEquipment } = await queryFulfilled;
          // Optimistic update
          dispatch(
            equipmentApi.util.updateQueryData('getEquipmentList', {}, (draft) => {
              draft.data.unshift(newEquipment);
            })
          );
        } catch {
          // Rollback optimistic update on error
        }
      },
    }),
    updateEquipment: builder.mutation({
      query: ({ id, ...equipment }) => ({
        url: `/equipment/${id}`,
        method: 'PUT',
        body: equipment,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Equipment', id },
        { type: 'Equipment', id: 'LIST' },
      ],
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          equipmentApi.util.updateQueryData('getEquipmentById', id, (draft) => {
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
    deleteEquipment: builder.mutation({
      query: (id) => ({
        url: `/equipment/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Equipment', id },
        { type: 'Equipment', id: 'LIST' },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          equipmentApi.util.updateQueryData('getEquipmentList', {}, (draft) => {
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
  useGetEquipmentListQuery,
  useGetEquipmentByIdQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
  usePrefetch,
} = equipmentApi;
