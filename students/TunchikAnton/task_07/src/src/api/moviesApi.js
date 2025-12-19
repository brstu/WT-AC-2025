import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Безопасное получение URL API
const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  }
  // Для CRA или других окружений
  return process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
}

export const moviesApi = createApi({
  reducerPath: 'moviesApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getBaseUrl(),
  }),
  tagTypes: ['Movie'],
  endpoints: (builder) => ({
    getMovies: builder.query({
      query: () => '/movies',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Movie', id })),
              { type: 'Movie', id: 'LIST' },
            ]
          : [{ type: 'Movie', id: 'LIST' }],
    }),
    getMovie: builder.query({
      query: (id) => {
        if (!id) throw new Error('ID is required')
        return `/movies/${id}`
      },
      providesTags: (result, error, id) => [{ type: 'Movie', id }],
    }),
    createMovie: builder.mutation({
      query: (movie) => ({
        url: '/movies',
        method: 'POST',
        body: movie,
      }),
      invalidatesTags: [{ type: 'Movie', id: 'LIST' }],
    }),
    updateMovie: builder.mutation({
      query: ({ id, ...movie }) => {
        if (!id) throw new Error('ID is required')
        return {
          url: `/movies/${id}`,
          method: 'PUT',
          body: movie,
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Movie', id }],
    }),
    deleteMovie: builder.mutation({
      query: (id) => {
        if (!id) throw new Error('ID is required')
        return {
          url: `/movies/${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (result, error, id) => [{ type: 'Movie', id }, { type: 'Movie', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetMoviesQuery,
  useGetMovieQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} = moviesApi