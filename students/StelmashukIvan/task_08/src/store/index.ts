import { configureStore } from '@reduxjs/toolkit'
import { booksApi } from '../features/books/booksApi'
import { reviewsApi } from '../features/reviews/reviewsApi'
import booksReducer from '../features/books/booksSlice'

export const store = configureStore({
  reducer: {
    books: booksReducer,
    [booksApi.reducerPath]: booksApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(booksApi.middleware, reviewsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch