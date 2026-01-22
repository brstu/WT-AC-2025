import { configureStore } from '@reduxjs/toolkit';
import { api } from '../shared/api';
import authReducer from '../features/auth/authSlice';
import appReducer from './appSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    app: appReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(api.middleware),
});

// ✅ ВОТ ЭТО
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
