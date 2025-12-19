import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Tournament {
  id: number;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
}

export const tournamentsApi = createApi({
  reducerPath: "tournamentsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  tagTypes: ["Tournament"],
  endpoints: (builder) => ({
    getTournaments: builder.query<Tournament[], void>({
      query: () => "/tournaments",
      providesTags: ["Tournament"],
    }),
    getTournament: builder.query<Tournament, number>({
      query: (id) => `/tournaments/${id}`,
    }),
    createTournament: builder.mutation<void, Partial<Tournament>>({
      query: (body) => ({
        url: "/tournaments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tournament"],
    }),
    updateTournament: builder.mutation<
      void,
      { id: number } & Partial<Tournament>
    >({
      query: ({ id, ...body }) => ({
        url: `/tournaments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Tournament"],
    }),
    deleteTournament: builder.mutation<void, number>({
      query: (id) => ({
        url: `/tournaments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tournament"],
    }),
  }),
});

export const {
  useGetTournamentsQuery,
  useGetTournamentQuery,
  useCreateTournamentMutation,
  useUpdateTournamentMutation,
  useDeleteTournamentMutation,
} = tournamentsApi;
