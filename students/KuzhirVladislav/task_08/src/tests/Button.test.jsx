import { render, screen } from '@testing-library/react';
import Button from '../components/Button.jsx';

test('renders primary button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: /click me/i })).toHaveClass('btn');
});

test('renders danger variant', () => {
  render(<Button variant="danger">Delete</Button>);
  expect(screen.getByRole('button', { name: /delete/i })).toHaveClass('btn-danger');
});
