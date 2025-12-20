// features/movies/moviesApi.ts

import type { Movie } from '../../shared/types';
import type { PaginatedResponse } from '../../shared/types';
import {
  useGetMoviesQuery,
  useGetMovieQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} from '../../shared/api';

/**
 * Re-export RTK Query hooks for Movie feature
 * This keeps feature-level encapsulation
 */

export {
  useGetMoviesQuery,
  useGetMovieQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
};

export type {
  Movie,
  PaginatedResponse,
};
