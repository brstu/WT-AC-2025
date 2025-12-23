import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ParticipationRequest {
  id: number;
  eventId: number;
  participantName: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export const participationRequestsApi = createApi({
  reducerPath: "participationRequestsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  tagTypes: ["ParticipationRequest"],
  endpoints: (builder) => ({
    getRequestsByEvent: builder.query<ParticipationRequest[], number>({
      query: (eventId) => `/participationRequests?eventId=${eventId}`,
      providesTags: ["ParticipationRequest"],
    }),
    createRequest: builder.mutation<void, Partial<ParticipationRequest>>({
      query: (body) => ({
        url: "/participationRequests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ParticipationRequest"],
    }),
    updateRequest: builder.mutation<
      void,
      { id: number } & Partial<ParticipationRequest>
    >({
      query: ({ id, ...body }) => ({
        url: `/participationRequests/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ParticipationRequest"],
    }),
    deleteRequest: builder.mutation<void, number>({
      query: (id) => ({
        url: `/participationRequests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ParticipationRequest"],
    }),
  }),
});

export const {
  useGetRequestsByEventQuery,
  useCreateRequestMutation,
  useUpdateRequestMutation,
  useDeleteRequestMutation,
} = participationRequestsApi;
