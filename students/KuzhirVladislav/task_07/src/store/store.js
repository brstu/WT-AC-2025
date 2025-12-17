import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice.js';
import favoritesReducer from './favoritesSlice.js';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});
