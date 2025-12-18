import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_API_URL}/` }),
  tagTypes: ["Note"],
  endpoints: (builder) => ({
    getNotes: builder.query<Note[], void>({
      query: (): string => "notes",
      providesTags: ["Note"],
    }),
    getNote: builder.query<Note, number>({
      query: (id: number): string => `notes/${id}`,
      providesTags: ["Note"],
    }),
    createNote: builder.mutation<Note, Partial<Note>>({
      query: (body: Partial<Note>) => ({ url: "notes", method: "POST", body }),
      invalidatesTags: ["Note"],
      async onQueryStarted(note, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData("getNotes", undefined, (draft: Note[]) => {
            draft.push({ id: Date.now(), ...note } as Note);
          })
        ) as { undo: () => void };
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    updateNote: builder.mutation<Note, Partial<Note> & Pick<Note, "id">>({
      query: ({ id, ...body }: Partial<Note> & Pick<Note, "id">) => ({ url: `notes/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Note"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { id, ...patch } = arg;
        const patchResult = dispatch(
          api.util.updateQueryData("getNotes", undefined, (draft: Note[]) => {
            const note = draft.find((n) => n.id === id);
            if (note) Object.assign(note, patch);
          })
        ) as { undo: () => void };
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteNote: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id: number) => ({ url: `notes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Note"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData("getNotes", undefined, (draft: Note[]) => {
            const index = draft.findIndex((n) => n.id === id);
            if (index !== -1) draft.splice(index, 1);
          })
        ) as { undo: () => void };
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  usePrefetch, // Для бонусной предзагрузки
} = api;