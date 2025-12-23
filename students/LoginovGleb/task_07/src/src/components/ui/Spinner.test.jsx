import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner Component', () => {
  it('renders spinner element', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom size class', () => {
    const { container } = render(<Spinner size="large" />);
    const spinner = container.querySelector('.spinner');
    expect(spinner).toHaveClass('spinner-large');
  });

  it('renders with default size', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('.spinner');
    expect(spinner).toHaveClass('spinner');
  });

  it('displays message when provided', () => {
    render(<Spinner message="Loading data..." />);
    expect(screen.getByText(/loading data/i)).toBeInTheDocument();
  });
});
