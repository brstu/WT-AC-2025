import { configureStore } from '@reduxjs/toolkit'
import { moviesApi } from '../api/moviesApi'

export const store = configureStore({
  reducer: {
    [moviesApi.reducerPath]: moviesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(moviesApi.middleware),
})