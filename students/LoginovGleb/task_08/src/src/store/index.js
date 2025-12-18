import { configureStore } from '@reduxjs/toolkit';
import { equipmentApi } from '../features/equipment/api/equipmentApi';
import authReducer from '../features/auth/authSlice';
import themeReducer from './themeSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    [equipmentApi.reducerPath]: equipmentApi.reducer,
    auth: authReducer,
    theme: themeReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(equipmentApi.middleware),
});
