import { configureStore } from "@reduxjs/toolkit";
import { eventsApi } from "../features/events/api";
import { participationRequestsApi } from "../features/participationRequests/api";

export const store = configureStore({
  reducer: {
    [eventsApi.reducerPath]: eventsApi.reducer,
    [participationRequestsApi.reducerPath]: participationRequestsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(eventsApi.middleware)
      .concat(participationRequestsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
