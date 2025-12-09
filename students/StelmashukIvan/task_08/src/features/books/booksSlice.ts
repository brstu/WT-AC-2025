import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Book } from './booksTypes'

interface BooksState {
  recentlyViewed: string[]
  favorites: string[]
  searchHistory: string[]
}

const initialState: BooksState = {
  recentlyViewed: JSON.parse(localStorage.getItem('recentlyViewed') || '[]'),
  favorites: JSON.parse(localStorage.getItem('favoriteBooks') || '[]'),
  searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    addToRecentlyViewed: (state, action: PayloadAction<string>) => {
      // Удаляем дубликаты
      state.recentlyViewed = state.recentlyViewed.filter(id => id !== action.payload)
      // Добавляем в начало
      state.recentlyViewed.unshift(action.payload)
      // Ограничиваем размер
      if (state.recentlyViewed.length > 10) {
        state.recentlyViewed.pop()
      }
      localStorage.setItem('recentlyViewed', JSON.stringify(state.recentlyViewed))
    },
    
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const index = state.favorites.indexOf(action.payload)
      if (index === -1) {
        state.favorites.push(action.payload)
      } else {
        state.favorites.splice(index, 1)
      }
      localStorage.setItem('favoriteBooks', JSON.stringify(state.favorites))
    },
    
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      if (!action.payload.trim()) return
      
      // Удаляем дубликаты
      state.searchHistory = state.searchHistory.filter(
        term => term.toLowerCase() !== action.payload.toLowerCase()
      )
      
      // Добавляем в начало
      state.searchHistory.unshift(action.payload)
      
      // Ограничиваем размер
      if (state.searchHistory.length > 10) {
        state.searchHistory.pop()
      }
      
      localStorage.setItem('searchHistory', JSON.stringify(state.searchHistory))
    },
    
    clearSearchHistory: (state) => {
      state.searchHistory = []
      localStorage.removeItem('searchHistory')
    },
    
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = []
      localStorage.removeItem('recentlyViewed')
    },
    
    clearFavorites: (state) => {
      state.favorites = []
      localStorage.removeItem('favoriteBooks')
    },
  },
})

export const {
  addToRecentlyViewed,
  toggleFavorite,
  addToSearchHistory,
  clearSearchHistory,
  clearRecentlyViewed,
  clearFavorites,
} = booksSlice.actions

export const selectRecentlyViewed = (state: { books: BooksState }) => state.books.recentlyViewed
export const selectFavorites = (state: { books: BooksState }) => state.books.favorites
export const selectSearchHistory = (state: { books: BooksState }) => state.books.searchHistory

export default booksSlice.reducer