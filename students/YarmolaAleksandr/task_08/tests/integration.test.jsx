import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: key => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe('App Integration Tests', () => {
  beforeEach(() => {
    global.localStorage = localStorageMock;
    localStorage.clear();
  });

  it('should create a new playlist', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'My Music Playlist');
    await user.type(
      screen.getByLabelText(/description/i),
      'Best songs collection'
    );
    await user.selectOptions(screen.getByLabelText(/category/i), 'music');
    await user.clear(screen.getByLabelText(/video count/i));
    await user.type(screen.getByLabelText(/video count/i), '15');
    await user.click(screen.getByLabelText(/public/i));

    // Submit
    await user.click(screen.getByTestId('submit-button'));

    // Verify
    await waitFor(() => {
      expect(screen.getByText('My Music Playlist')).toBeInTheDocument();
    });
  });

  it('should edit an existing playlist', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create playlist first
    await user.type(screen.getByLabelText(/title/i), 'Original Title');
    await user.selectOptions(screen.getByLabelText(/category/i), 'gaming');
    await user.click(screen.getByTestId('submit-button'));

    // Edit
    await waitFor(() => {
      expect(screen.getByText('Original Title')).toBeInTheDocument();
    });

    const editButton = screen.getByTestId('edit-button');
    await user.click(editButton);

    // Update title
    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');
    await user.click(screen.getByTestId('submit-button'));

    // Verify
    await waitFor(() => {
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
      expect(screen.queryByText('Original Title')).not.toBeInTheDocument();
    });
  });

  it('should delete a playlist', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn(() => true));

    render(<App />);

    // Create playlist
    await user.type(screen.getByLabelText(/title/i), 'Playlist to Delete');
    await user.selectOptions(screen.getByLabelText(/category/i), 'education');
    await user.click(screen.getByTestId('submit-button'));

    // Verify created
    await waitFor(() => {
      expect(screen.getByText('Playlist to Delete')).toBeInTheDocument();
    });

    // Delete
    const deleteButton = screen.getByTestId('delete-button');
    await user.click(deleteButton);

    // Verify deleted
    await waitFor(() => {
      expect(
        screen.queryByText('Playlist to Delete')
      ).not.toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  });

  it('should validate form and show errors', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Try to submit empty form
    await user.click(screen.getByTestId('submit-button'));

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  it('should cancel edit mode', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create playlist
    await user.type(screen.getByLabelText(/title/i), 'Test Playlist');
    await user.selectOptions(screen.getByLabelText(/category/i), 'music');
    await user.click(screen.getByTestId('submit-button'));

    // Start edit
    await waitFor(() => {
      expect(screen.getByText('Test Playlist')).toBeInTheDocument();
    });
    await user.click(screen.getByTestId('edit-button'));

    // Cancel edit
    await user.click(screen.getByTestId('cancel-button'));

    // Form should be in create mode again
    expect(screen.getByText(/Create New Playlist/i)).toBeInTheDocument();
  });
});
