import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import { programsApi } from './api/programsApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [programsApi.reducerPath]: programsApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(programsApi.middleware),
})