import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('should render app header', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /YouTube Playlist Manager/i, level: 1 })).toBeInTheDocument();
  });

  it('should render form section', () => {
    render(<App />);
    expect(screen.getByText(/Create New Playlist/i)).toBeInTheDocument();
  });

  it('should render playlist list section', () => {
    render(<App />);
    expect(screen.getByText(/My Playlists/i)).toBeInTheDocument();
  });

  it('should show empty state when no playlists', () => {
    render(<App />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});
