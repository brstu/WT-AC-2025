import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store/store.js';
import MuseumsList from '../pages/MuseumsList.jsx';

vi.mock(
  '../store/apiSlice.js',
  () => ({
    apiSlice: {
      reducerPath: 'api',
      reducer: (state = {}) => state,
      middleware: () => (next) => (action) => next(action),
    },
    useGetMuseumsQuery: () => ({ data: [{ id: 1, title: 'Test' }], isLoading: false, error: null }),
    useDeleteMuseumMutation: () => [
      vi.fn().mockResolvedValue({ data: {} }),
      { isLoading: false },
    ],
  }),
  { virtual: false }
);

test('renders museums list', () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <MuseumsList />
      </BrowserRouter>
    </Provider>
  );
  expect(screen.getByText('Test')).toBeInTheDocument();
});
