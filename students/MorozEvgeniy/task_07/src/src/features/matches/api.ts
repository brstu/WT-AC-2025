import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Match {
  id: number;
  tournamentId: number;
  teamA: string;
  teamB: string;
  score: string;
  date: string;
}

export const matchesApi = createApi({
  reducerPath: "matchesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  endpoints: (builder) => ({
    getMatchesByTournament: builder.query<Match[], number>({
      query: (tournamentId) => `/matches?tournamentId=${tournamentId}`,
    }),
  }),
});

export const { useGetMatchesByTournamentQuery } = matchesApi;
