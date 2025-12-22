import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Theme, Notification } from '../shared/types/index';


export interface AppState {
  theme: Theme;
  notifications: Notification[];
  sidebarOpen: boolean;
}

const initialState: AppState = {
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  notifications: [],
  sidebarOpen: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id'>>
    ) => {
      state.notifications.push({
        ...action.payload,
        id: Date.now().toString(),
      });
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleSidebar,
  setSidebarOpen,
} = appSlice.actions;

export default appSlice.reducer;
