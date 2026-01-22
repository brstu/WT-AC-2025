import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const recipesApi = createApi({
  reducerPath: 'recipesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL
  }),
  tagTypes: ['Recipes'],
  endpoints: (builder) => ({
    getRecipes: builder.query({
      query: () => '/recipes',
      providesTags: ['Recipes']
    }),
    getRecipe: builder.query({
      query: (id) => `/recipes/${id}`
    }),
    addRecipe: builder.mutation({
      query: (recipe) => ({
        url: '/recipes',
        method: 'POST',
        body: recipe
      }),
      invalidatesTags: ['Recipes']
    }),
    updateRecipe: builder.mutation({
      query: ({ id, ...recipe }) => ({
        url: `/recipes/${id}`,
        method: 'PUT',
        body: recipe
      }),
      invalidatesTags: ['Recipes']
    }),
    deleteRecipe: builder.mutation({
      query: (id) => ({
        url: `/recipes/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Recipes']
    })
  })
})

export const {
  useGetRecipesQuery,
  useGetRecipeQuery,
  useAddRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation
} = recipesApi
