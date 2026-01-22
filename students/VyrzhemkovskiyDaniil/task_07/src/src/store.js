import { configureStore, createSlice } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import toast from 'react-hot-toast'

const authSlice = createSlice({
  name: 'auth',
  initialState: { 
    user: null, 
    token: localStorage.getItem('token') 
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('token', action.payload.token)
      toast.success('Login successful!')
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      toast.success('Logged out successfully')
    }
  }
})

export const api = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const result = await fetchBaseQuery({
      baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      prepareHeaders: (headers) => {
        const token = localStorage.getItem('token')
        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }
        return headers
      }
    })(args, api, extraOptions)

    if (result.error) {
      toast.error(result.error.data?.message || 'Something went wrong')
    }

    return result
  },
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: (filters) => ({
        url: '/tasks',
        params: filters
      }),
      providesTags: ['Task']
    }),
    getTask: builder.query({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }]
    }),
    createTask: builder.mutation({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body
      }),
      async onQueryStarted(newTask, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getTasks', undefined, (draft) => {
            draft.unshift({ ...newTask, id: 'temp-id' })
          })
        )
        
        try {
          const { data } = await queryFulfilled
          dispatch(
            api.util.updateQueryData('getTasks', undefined, (draft) => {
              const index = draft.findIndex(task => task.id === 'temp-id')
              if (index !== -1) {
                draft[index] = data
              }
            })
          )
          toast.success('Task created successfully!')
        } catch {
          patchResult.undo()
          toast.error('Failed to create task')
        }
      },
      invalidatesTags: ['Task']
    }),
    updateTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: data
      }),
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getTask', id, (draft) => {
            Object.assign(draft, data)
          })
        )
        
        const tasksPatch = dispatch(
          api.util.updateQueryData('getTasks', undefined, (draft) => {
            const task = draft.find(t => t.id === id)
            if (task) {
              Object.assign(task, data)
            }
          })
        )
        
        try {
          await queryFulfilled
          toast.success('Task updated successfully!')
        } catch {
          patchResult.undo()
          tasksPatch.undo()
          toast.error('Failed to update task')
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Task', id }]
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE'
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getTasks', undefined, (draft) => {
            return draft.filter(task => task.id !== id)
          })
        )
        
        try {
          await queryFulfilled
          toast.success('Task deleted successfully!')
        } catch {
          patchResult.undo()
          toast.error('Failed to delete task')
        }
      },
      invalidatesTags: ['Task']
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      })
    })
  })
})

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
})

export const { loginSuccess, logout } = authSlice.actions
export const { 
  useGetTasksQuery, 
  useGetTaskQuery, 
  useCreateTaskMutation, 
  useUpdateTaskMutation, 
  useDeleteTaskMutation,
  useLoginMutation 
} = api