import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { shopApi } from '../api/shopApi';
import cartReducer from '../../../store/cartSlice';

const createTestStore = () => {
  return configureStore({
    reducer: {
      [shopApi.reducerPath]: shopApi.reducer,
      cart: cartReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(shopApi.middleware),
  });
};

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'A test product',
    price: 99.99,
    image: 'https://via.placeholder.com/300',
    category: 'electronics',
    stock: 5,
    rating: 4.5,
  };

  it('renders product card with product info', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCard product={mockProduct} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('A test product')).toBeInTheDocument();
    expect(screen.getByText(/\$99.99/)).toBeInTheDocument();
  });

  it('displays out of stock when stock is 0', () => {
    const store = createTestStore();
    const outOfStockProduct = { ...mockProduct, stock: 0 };

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCard product={outOfStockProduct} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('displays add to cart button when stock is available', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCard product={mockProduct} />
        </BrowserRouter>
      </Provider>
    );

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeDisabled();
  });
});
