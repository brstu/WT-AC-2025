import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/posts`,
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ['Museum'],
  endpoints: (builder) => ({
    getMuseums: builder.query({
      query: () => '',
      providesTags: ['Museum'],
    }),
    getMuseum: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['Museum'],
    }),
    createMuseum: builder.mutation({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error('Create error:', err);
        }
      },
      invalidatesTags: ['Museum'],
    }),
    updateMuseum: builder.mutation({
      query: (data) => {
        const { id, ...body } = data;
        return {
          url: `/${id}`,
          method: 'PUT',
          body,
        };
      },
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error('Update error:', err);
        }
      },
      invalidatesTags: ['Museum'],
    }),
    deleteMuseum: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error('Delete error:', err);
        }
      },
      invalidatesTags: ['Museum'],
    }),
  }),
});

export const {
  useGetMuseumsQuery,
  useGetMuseumQuery,
  useCreateMuseumMutation,
  useUpdateMuseumMutation,
  useDeleteMuseumMutation,
} = apiSlice;
