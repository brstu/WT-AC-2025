import { configureStore } from '@reduxjs/toolkit';
import { gamesApi } from '../features/games/api/gamesApi';
import authReducer from '../features/auth/authSlice';
import themeReducer from './themeSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    [gamesApi.reducerPath]: gamesApi.reducer,
    auth: authReducer,
    theme: themeReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(gamesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
