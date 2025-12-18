import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store/store.js';
import MuseumsList from '../pages/MuseumsList.jsx';

jest.mock('../store/apiSlice.js', () => ({
  useGetMuseumsQuery: () => ({ data: [{ id: '1', title: 'Test Museum' }], isLoading: false }),
}));

test('renders museum list', () => {
  render(
    <Provider store={store}>
      <MuseumsList />
    </Provider>
  );
  expect(screen.getByText('Test Museum')).toBeInTheDocument();
});
