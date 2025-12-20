import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gamesAPI } from '../../services/api'

export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (_, { rejectWithValue }) => {
    try {
      return await gamesAPI.getAllGames()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchGameById = createAsyncThunk(
  'games/fetchGameById',
  async (id, { rejectWithValue }) => {
    try {
      return await gamesAPI.getGameById(id)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createGame = createAsyncThunk(
  'games/createGame',
  async (gameData, { rejectWithValue }) => {
    try {
      return await gamesAPI.createGame(gameData)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateGame = createAsyncThunk(
  'games/updateGame',
  async ({ id, gameData }, { rejectWithValue }) => {
    try {
      return await gamesAPI.updateGame(id, gameData)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteGame = createAsyncThunk(
  'games/deleteGame',
  async (id, { rejectWithValue }) => {
    try {
      await gamesAPI.deleteGame(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const gamesSlice = createSlice({
  name: 'games',
  initialState: {
    items: [],
    currentGame: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentGame: (state) => {
      state.currentGame = null
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchGames.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      .addCase(fetchGameById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.loading = false
        state.currentGame = action.payload
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
     
      .addCase(createGame.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
     
      .addCase(updateGame.fulfilled, (state, action) => {
        const index = state.items.findIndex(game => game.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.currentGame && state.currentGame.id === action.payload.id) {
          state.currentGame = action.payload
        }
      })
      
      .addCase(deleteGame.fulfilled, (state, action) => {
        state.items = state.items.filter(game => game.id !== action.payload)
      })
  },
})

export const { clearError, clearCurrentGame } = gamesSlice.actions
export default gamesSlice.reducer