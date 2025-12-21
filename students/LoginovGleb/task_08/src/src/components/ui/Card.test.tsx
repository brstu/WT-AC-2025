import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders children content', () => {
    render(
      <Card>
        <p>Test Content</p>
      </Card>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default card class', () => {
    const { container } = render(<Card>Content</Card>);
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('card');
  });

  it('applies custom className along with default card class', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('card');
    expect(cardElement).toHaveClass('custom-card');
  });

  it('renders multiple children', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
