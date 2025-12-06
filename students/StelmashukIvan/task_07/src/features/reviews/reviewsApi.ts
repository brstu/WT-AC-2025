import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface Review {
  id: string
  bookId: string
  author: string
  content: string
  rating: number
  createdAt: string
}

export interface ReviewFormData {
  bookId: string
  author: string
  content: string
  rating: number
}

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_URL}/reviews` }),
  tagTypes: ['Review'],
  endpoints: (builder) => ({
    getReviewsByBookId: builder.query<Review[], string>({
      query: (bookId) => `?bookId=${bookId}`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Review' as const, id })), 'Review']
          : ['Review'],
    }),
    
    createReview: builder.mutation<Review, ReviewFormData>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Review'],
    }),
    
    deleteReview: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
    }),
  }),
})

export const {
  useGetReviewsByBookIdQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi