import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchPage from './SearchPage';

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ artists: [{ id: '1', name: 'ABBA' }], count: 1 }),
});

function wrapper(children: React.ReactNode) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe('SearchPage', () => {
  it('renders results', async () => {
    render(wrapper(<SearchPage />));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abba' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => expect(screen.getByText('ABBA')).toBeInTheDocument());
  });
});
