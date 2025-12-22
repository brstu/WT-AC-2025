import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Podcast, CreatePodcastDto, UpdatePodcastDto } from '../podcasts/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const podcastApi = createApi({
  reducerPath: 'podcastApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['Podcast'],
  endpoints: (builder) => ({
    getPodcasts: builder.query<Podcast[], void>({
      query: () => 'podcasts',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Podcast' as const, id })),
              { type: 'Podcast', id: 'LIST' },
            ]
          : [{ type: 'Podcast', id: 'LIST' }],
    }),
    getPodcast: builder.query<Podcast, string>({
      query: (id) => `podcasts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Podcast', id }],
    }),
    createPodcast: builder.mutation<Podcast, CreatePodcastDto>({
      query: (body) => ({
        url: 'podcasts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Podcast', id: 'LIST' }],
    }),
    updatePodcast: builder.mutation<Podcast, { id: string; data: UpdatePodcastDto }>({
      query: ({ id, data }) => ({
        url: `podcasts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Podcast', id }],
    }),
    deletePodcast: builder.mutation<void, string>({
      query: (id) => ({
        url: `podcasts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Podcast', id }],
    }),
  }),
})

export const {
  useGetPodcastsQuery,
  useGetPodcastQuery,
  useCreatePodcastMutation,
  useUpdatePodcastMutation,
  useDeletePodcastMutation,
} = podcastApi