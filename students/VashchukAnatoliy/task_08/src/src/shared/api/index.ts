import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Movie, PaginatedResponse } from '../types';

/* =========================================================
   REAL BASE QUERY
========================================================= */

const realBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/* =========================================================
   MOCK STORAGE (НЕ ЗАМОРОЖЕННЫЙ!)
========================================================= */

let mockMoviesStore: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    description: 'A mind-bending sci-fi thriller about dreams within dreams.',
    year: 2010,
    rating: 8.8,
    posterUrl:
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400&h=600&fit=crop',
    createdAt: '2010-07-16T00:00:00Z',
    updatedAt: '2010-07-16T00:00:00Z',
  },
  {
    id: '2',
    title: 'The Matrix',
    description:
      'A hacker discovers the reality he lives in is a simulated world.',
    year: 1999,
    rating: 8.7,
    posterUrl:
      'https://images.unsplash.com/photo-1505685296765-3a2736de412f?w=400&h=600&fit=crop',
    createdAt: '1999-03-31T00:00:00Z',
    updatedAt: '1999-03-31T00:00:00Z',
  },
];

/* =========================================================
   BASE QUERY WITH MOCK
========================================================= */

const baseQueryWithMock = async (args: any, api: any, extraOptions: any) => {
  const useMock = import.meta.env.VITE_MOCK_API === 'true';

  if (!useMock) {
    return realBaseQuery(args, api, extraOptions);
  }

  await new Promise((r) => setTimeout(r, 300));

  const { url, method = 'GET', body } =
    typeof args === 'string' ? { url: args } : args;

  const cleanUrl = url.split('?')[0];

  /* =======================
     GET /movies
  ======================= */
  if (method === 'GET' && cleanUrl === '/movies') {
    return {
      data: {
        data: [...mockMoviesStore], // ❗ всегда копия
        pagination: {
          page: 1,
          limit: 10,
          total: mockMoviesStore.length,
          totalPages: 1,
        },
      } satisfies PaginatedResponse<Movie>,
    };
  }

  /* =======================
     GET /movies/:id
  ======================= */
  if (method === 'GET' && cleanUrl.startsWith('/movies/')) {
    const id = cleanUrl.replace('/movies/', '');
    const movie = mockMoviesStore.find((m) => m.id === id);

    return movie
      ? { data: { ...movie } } // ❗ копия
      : { error: { status: 404, data: { message: 'Movie not found' } } };
  }

  /* =======================
     POST /movies
  ======================= */
  if (method === 'POST' && cleanUrl === '/movies') {
    const newMovie: Movie = {
      ...(body as Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockMoviesStore = [newMovie, ...mockMoviesStore];

    return { data: { ...newMovie } };
  }

  /* =======================
     PUT /movies/:id
  ======================= */
  if (method === 'PUT' && cleanUrl.startsWith('/movies/')) {
    const id = cleanUrl.replace('/movies/', '');

    let updatedMovie: Movie | undefined;

    mockMoviesStore = mockMoviesStore.map((movie) => {
      if (movie.id !== id) return movie;

      updatedMovie = {
        ...movie,
        ...(body as Partial<Movie>),
        updatedAt: new Date().toISOString(),
      };

      return updatedMovie;
    });

    return updatedMovie
      ? { data: { ...updatedMovie } }
      : { error: { status: 404, data: { message: 'Movie not found' } } };
  }

  /* =======================
     DELETE /movies/:id
  ======================= */
  if (method === 'DELETE' && cleanUrl.startsWith('/movies/')) {
    const id = cleanUrl.replace('/movies/', '');

    mockMoviesStore = mockMoviesStore.filter((m) => m.id !== id);

    return { data: { success: true } };
  }

  return { error: { status: 404, data: { message: 'Not found' } } };
};

/* =========================================================
   RTK QUERY API
========================================================= */

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithMock,
  tagTypes: ['Movie'],
  endpoints: (builder) => ({
    getMovies: builder.query<
      PaginatedResponse<Movie>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search ? { search } : {}),
        });
        return `/movies?${params}`;
      },
      providesTags: ['Movie'],
    }),

    getMovie: builder.query<Movie, string>({
      query: (id) => `/movies/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Movie', id }],
    }),

    createMovie: builder.mutation<
      Movie,
      Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>
    >({
      query: (movie) => ({
        url: '/movies',
        method: 'POST',
        body: movie,
      }),
      invalidatesTags: ['Movie'],
    }),

    updateMovie: builder.mutation<
      Movie,
      { id: string; movie: Partial<Movie> }
    >({
      query: ({ id, movie }) => ({
        url: `/movies/${id}`,
        method: 'PUT',
        body: movie,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Movie', id }],
    }),

    deleteMovie: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/movies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Movie'],
    }),
  }),
});

/* =========================================================
   HOOKS
========================================================= */

export const {
  useGetMoviesQuery,
  useGetMovieQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} = api;
