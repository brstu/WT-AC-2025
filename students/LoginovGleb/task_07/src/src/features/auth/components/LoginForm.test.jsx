import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm Component', () => {
  it('renders login form with all fields', () => {
    render(<LoginForm onSubmit={() => {}} />);
    
    expect(screen.getByText(/вход в систему/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/имя пользователя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /войти/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/имя пользователя обязательно/i)).toBeInTheDocument();
      expect(screen.getByText(/пароль обязателен/i)).toBeInTheDocument();
    });
    
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data when valid', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/имя пользователя/i), 'testuser');
    await user.type(screen.getByLabelText(/пароль/i), 'testpass123');
    
    await user.click(screen.getByRole('button', { name: /войти/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
      const callArgs = handleSubmit.mock.calls[0][0];
      expect(callArgs).toEqual({
        username: 'testuser',
        password: 'testpass123',
      });
    });
  });

  it('disables submit button when isLoading is true', () => {
    render(<LoginForm onSubmit={() => {}} isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /вход.../i });
    expect(submitButton).toBeDisabled();
  });

  it('changes button text when loading', () => {
    const { rerender } = render(<LoginForm onSubmit={() => {}} isLoading={false} />);
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    
    rerender(<LoginForm onSubmit={() => {}} isLoading={true} />);
    expect(screen.getByRole('button', { name: /вход.../i })).toBeInTheDocument();
  });

  it('displays demo hint message', () => {
    render(<LoginForm onSubmit={() => {}} />);
    expect(screen.getByText(/для демонстрации используйте любые учетные данные/i)).toBeInTheDocument();
  });
});
