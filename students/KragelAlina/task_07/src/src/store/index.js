import { configureStore } from '@reduxjs/toolkit';
import { shopApi } from '../features/shop/api/shopApi';
import authReducer from '../features/auth/authSlice';
import themeReducer from './themeSlice';
import notificationReducer from './notificationSlice';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    [shopApi.reducerPath]: shopApi.reducer,
    auth: authReducer,
    theme: themeReducer,
    notification: notificationReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(shopApi.middleware),
});
