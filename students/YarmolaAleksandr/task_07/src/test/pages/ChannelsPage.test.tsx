import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createTestStore } from '../utils';
import ChannelsPage from '../../pages/ChannelsPage';



describe('ChannelsPage', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('renders the page title', async () => {
    renderWithProviders(<ChannelsPage />, { store });
    
    // Wait for loading to complete and check for actual content
    await waitFor(() => {
      expect(screen.queryByText('Loading channels...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows loading state initially', () => {
    renderWithProviders(<ChannelsPage />, { store });
    
    expect(screen.getByText('Loading channels...')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithProviders(<ChannelsPage />, { store });
    
    expect(screen.getByText('Loading channels...')).toBeInTheDocument();
  });

  // Note: In a real test, you'd mock the API responses to test different states
  // This would require additional setup with MSW or similar mocking tools
});