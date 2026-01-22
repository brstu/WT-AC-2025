import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders children content', () => {
    render(
      <Card>
        <h1>Test Content</h1>
      </Card>
    );
    expect(screen.getByText(/test content/i)).toBeInTheDocument();
  });

  it('applies default card class', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('card');
  });

  it('applies custom className along with default card class', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('card', 'custom-class');
  });

  it('renders complex children structure', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
        <button>Action</button>
      </Card>
    );
    
    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });
});
