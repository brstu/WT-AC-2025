import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  it('renders input without label', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(<Input label="Email" error="Email is required" />);
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('applies error class when error exists', () => {
    render(<Input label="Password" error="Password is required" />);
    const input = screen.getByLabelText(/password/i);
    expect(input).toHaveClass('input-error');
  });

  it('renders with correct input type', () => {
    render(<Input label="Password" type="password" />);
    const input = screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('passes additional props to input element', () => {
    render(<Input label="Test" disabled data-testid="custom-input" />);
    const input = screen.getByTestId('custom-input');
    expect(input).toBeDisabled();
  });
});
