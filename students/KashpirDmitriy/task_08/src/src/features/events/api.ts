import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Event {
  id: number;
  name: string;
  location: string;
  date: string;
  description?: string;
}

export const eventsApi = createApi({
  reducerPath: "eventsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  tagTypes: ["Event"],
  endpoints: (builder) => ({
    getEvents: builder.query<Event[], void>({
      query: () => "/events",
      providesTags: ["Event"],
    }),
    getEvent: builder.query<Event, number>({
      query: (id) => `/events/${id}`,
    }),
    createEvent: builder.mutation<void, Partial<Event>>({
      query: (body) => ({
        url: "/events",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Event"],
    }),
    updateEvent: builder.mutation<
      void,
      { id: number } & Partial<Event>
    >({
      query: ({ id, ...body }) => ({
        url: `/events/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Event"],
    }),
    deleteEvent: builder.mutation<void, number>({
      query: (id) => ({
        url: `/events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Event"],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventsApi;
