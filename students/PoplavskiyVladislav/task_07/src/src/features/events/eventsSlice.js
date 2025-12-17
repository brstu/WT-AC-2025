import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { eventsApi } from '../../api/eventsApi'

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      return await eventsApi.getAll()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id, { rejectWithValue }) => {
    try {
      return await eventsApi.getById(id)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      return await eventsApi.create({
        ...eventData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentParticipants: 0,
        status: 'active'
      })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      return await eventsApi.update(id, {
        ...eventData,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      await eventsApi.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    currentEvent: null,
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearCurrentEvent: (state) => {
      state.currentEvent = null
    },
    clearError: (state) => {
      state.error = null
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch Event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false
        state.currentEvent = action.payload
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
        state.successMessage = 'Мероприятие успешно создано'
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.currentEvent = action.payload
        state.successMessage = 'Мероприятие успешно обновлено'
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => item.id !== action.payload)
        state.successMessage = 'Мероприятие успешно удалено'
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearCurrentEvent, clearError, clearSuccessMessage } = eventsSlice.actions
export default eventsSlice.reducer