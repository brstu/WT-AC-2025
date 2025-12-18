import { configureStore } from "@reduxjs/toolkit";
import { tournamentsApi } from "../features/tournaments/api";
import { matchesApi } from "../features/matches/api";

export const store = configureStore({
  reducer: {
    [tournamentsApi.reducerPath]: tournamentsApi.reducer,
    [matchesApi.reducerPath]: matchesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(tournamentsApi.middleware)
      .concat(matchesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
