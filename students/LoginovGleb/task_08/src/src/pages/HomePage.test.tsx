import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HomePage } from './HomePage';
import authReducer from '../features/auth/authSlice';

// Helper function to render with providers
const renderWithProviders = (component, { preloadedState = {} } = {}) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('HomePage Integration Tests', () => {
  it('renders main title and subtitle', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText(/Каталог игр|Game Library/i)).toBeInTheDocument();
    expect(screen.getByText(/Управляйте коллекцией игр/i)).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated', () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
        },
      },
    });

    expect(screen.getByText('Войти в систему')).toBeInTheDocument();
    expect(screen.queryByText('Перейти к каталогу')).not.toBeInTheDocument();
  });

  it('shows games button when user is authenticated', () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: {
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          token: 'test-token',
          isAuthenticated: true,
        },
      },
    });

    expect(screen.getByText('Перейти к каталогу')).toBeInTheDocument();
    expect(screen.queryByText('Войти в систему')).not.toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText('Возможности системы')).toBeInTheDocument();
    expect(screen.getByText('🎮 Каталог игр')).toBeInTheDocument();
    expect(screen.getByText('🔍 Поиск и фильтрация')).toBeInTheDocument();
    expect(screen.getByText('⭐ Рейтинги и отзывы')).toBeInTheDocument();
    expect(screen.getByText('📊 Статистика')).toBeInTheDocument();
    expect(screen.getByText('🎯 Персонализация')).toBeInTheDocument();
    expect(screen.getByText('🔐 Безопасность')).toBeInTheDocument();
  });

  it('has correct link for login button', () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
        },
      },
    });

    const loginButton = screen.getByText('Войти в систему').closest('a');
    expect(loginButton).toHaveAttribute('href', '/login');
  });

  it('has correct link for games button', () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: {
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          token: 'test-token',
          isAuthenticated: true,
        },
      },
    });

    const gamesButton = screen.getByText('Перейти к каталогу').closest('a');
    expect(gamesButton).toHaveAttribute('href', '/games');
  });
});
