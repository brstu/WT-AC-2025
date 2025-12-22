import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Ad, Category, User, CreateAdRequest, UpdateAdRequest } from '../types'

const API_URL = import.meta.env.VITE_API_URL

export const adsApi = createApi({
  reducerPath: 'adsApi',
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
  tagTypes: ['Ad', 'Category', 'User'],
  endpoints: (builder) => ({
    // Объявления
    getAds: builder.query<{ ads: Ad[]; total: number }, { page?: number; limit?: number; category?: string; search?: string }>({
      query: ({ page = 1, limit = 10, category, search }) => ({
        url: '/ads',
        params: { page, limit, category, search }
      }),
      providesTags: ['Ad']
    }),

    getAdById: builder.query<Ad, string>({
      query: (id) => `/ads/${id}`,
      providesTags: (result, error, id) => [{ type: 'Ad', id }]
    }),

    createAd: builder.mutation<Ad, CreateAdRequest>({
      query: (ad) => ({
        url: '/ads',
        method: 'POST',
        body: ad
      }),
      invalidatesTags: ['Ad']
    }),

    updateAd: builder.mutation<Ad, { id: string; data: UpdateAdRequest }>({
      query: ({ id, data }) => ({
        url: `/ads/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ad', id }]
    }),

    deleteAd: builder.mutation<void, string>({
      query: (id) => ({
        url: `/ads/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Ad']
    }),

    // Категории
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category']
    }),

    // Аутентификация
    login: builder.mutation<{ user: User; token: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      })
    }),

    register: builder.mutation<User, { email: string; password: string; name: string }>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData
      })
    }),

    getProfile: builder.query<User, void>({
      query: () => '/auth/profile'
    })
  })
})

export const {
  useGetAdsQuery,
  useGetAdByIdQuery,
  useCreateAdMutation,
  useUpdateAdMutation,
  useDeleteAdMutation,
  useGetCategoriesQuery,
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery
} = adsApi
