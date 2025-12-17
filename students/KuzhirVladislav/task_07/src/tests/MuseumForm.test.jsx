import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store/store.js';
import MuseumForm from '../pages/MuseumForm.jsx';

vi.mock('../store/apiSlice.js', () => ({
  apiSlice: {
    reducerPath: 'api',
    reducer: (state = {}) => state,
    middleware: () => (next) => (action) => next(action),
  },
  useGetMuseumQuery: () => ({ data: null, isLoading: false, error: null }),
  useCreateMuseumMutation: () => [
    vi.fn().mockResolvedValue({ data: {} }),
    { isLoading: false },
  ],
  useUpdateMuseumMutation: () => [
    vi.fn().mockResolvedValue({ data: {} }),
    { isLoading: false },
  ],
}));

test('renders form', () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <MuseumForm />
      </BrowserRouter>
    </Provider>
  );
  expect(screen.getByLabelText('Name')).toBeInTheDocument();
});
