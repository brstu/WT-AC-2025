import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationState {
  message: string;
  type: NotificationType;
  isVisible: boolean;
}

export interface ShowNotificationPayload {
  message: string;
  type?: NotificationType;
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    message: '',
    type: 'info',
    isVisible: false,
  } as NotificationState,
  reducers: {
    showNotification: (state, action: PayloadAction<ShowNotificationPayload>) => {
      state.message = action.payload.message;
      state.type = action.payload.type || 'info';
      state.isVisible = true;
    },
    hideNotification: (state) => {
      state.isVisible = false;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
