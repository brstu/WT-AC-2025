import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Book, BookFormData } from './booksTypes'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const booksApi = createApi({
  reducerPath: 'booksApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${API_URL}/books`,
    prepareHeaders: (headers) => {
      // Можно добавить токен авторизации
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Book'],
  endpoints: (builder) => ({
    getBooks: builder.query<Book[], void>({
      query: () => '/',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Book' as const, id })), 'Book']
          : ['Book'],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled
        } catch (error) {
          toast.error('Не удалось загрузить книги')
        }
      },
    }),
    
    getBook: builder.query<Book, string>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: 'Book', id }],
    }),
    
    createBook: builder.mutation<Book, BookFormData>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Book'],
      onQueryStarted: async (_, { queryFulfilled }) => {
        await queryFulfilled
        toast.success('Книга успешно добавлена')
      },
    }),
    
    updateBook: builder.mutation<Book, { id: string; data: BookFormData }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Book', id }],
      onQueryStarted: async (_, { queryFulfilled }) => {
        await queryFulfilled
        toast.success('Книга успешно обновлена')
      },
    }),
    
    deleteBook: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Book'],
      onQueryStarted: async (id, { queryFulfilled, dispatch }) => {
        const patchResult = dispatch(
          booksApi.util.updateQueryData('getBooks', undefined, (draft) => {
            return draft.filter((book) => book.id !== id)
          })
        )
        try {
          await queryFulfilled
          toast.success('Книга удалена')
        } catch {
          patchResult.undo()
          toast.error('Не удалось удалить книгу')
        }
      },
    }),
  }),
})

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  usePrefetch,
} = booksApi