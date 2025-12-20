import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { api } from '../shared/api';

export function renderWithStore(ui: ReactElement) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });

  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}
