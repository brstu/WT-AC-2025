import { configureStore } from '@reduxjs/toolkit'
import { recipesApi } from './api'

export const store = configureStore({
  reducer: {
    [recipesApi.reducerPath]: recipesApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(recipesApi.middleware)
})
