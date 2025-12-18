import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EntryList from '../EntryList';

test('renders entry list header', () => {
  render(
    <MemoryRouter>
      <EntryList />
    </MemoryRouter>
  );
  expect(screen.getByText(/Add New Entry/i)).toBeInTheDocument();
});

test('displays no entries message when empty', () => {
  render(
    <MemoryRouter>
      <EntryList />
    </MemoryRouter>
  );
  expect(screen.getByText(/No entries yet/i)).toBeInTheDocument();
});

test('renders entries from localStorage', () => {
  localStorage.setItem(
    'diaryEntries',
    JSON.stringify([{ id: '1', date: '2023-01-01', text: 'Test', tags: [] }])
  );
  render(
    <MemoryRouter>
      <EntryList />
    </MemoryRouter>
  );
  expect(screen.getByText(/Test/i)).toBeInTheDocument();
  localStorage.clear();
});
