import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

import MoviesPage from '../../../pages/MoviesPage';
import { api } from '../../../shared/api';
import appReducer from '../../../app/appSlice';

/**
 * ✅ Реальный store, совместимый с MoviesPage
 */
const createTestStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      app: appReducer,
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });

describe('MoviesPage', () => {
  it('renders loading state', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <MoviesPage />
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByText(/loading movies/i)
    ).toBeInTheDocument();
  });
});
