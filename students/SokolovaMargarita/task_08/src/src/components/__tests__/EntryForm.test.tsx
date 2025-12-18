import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EntryForm from '../EntryForm';

test('renders form fields', () => {
  render(
    <MemoryRouter>
      <EntryForm />
    </MemoryRouter>
  );
  expect(screen.getByLabelText(/Date:/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Text:/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
});

test('submits new entry and saves to localStorage', () => {
  render(
    <MemoryRouter initialEntries={['/new']}>
      <EntryForm />
    </MemoryRouter>
  );
  fireEvent.change(screen.getByLabelText(/Text:/i), {
    target: { value: 'Integration test' },
  });
  fireEvent.click(screen.getByText(/Save/i));
  const stored = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
  expect(stored[0].text).toBe('Integration test');
  localStorage.clear();
});
