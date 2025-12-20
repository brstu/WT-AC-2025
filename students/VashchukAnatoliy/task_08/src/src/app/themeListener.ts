import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setTheme, toggleTheme } from './appSlice';

export const themeListener = createListenerMiddleware();

themeListener.startListening({
  matcher: (action) =>
    setTheme.match(action) || toggleTheme.match(action),
  effect: (_, listenerApi) => {
    const state = listenerApi.getState() as any;
    const theme = state.app.theme;

    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
});
