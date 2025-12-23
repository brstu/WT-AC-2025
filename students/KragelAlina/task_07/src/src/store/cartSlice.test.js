import { describe, it, expect, beforeEach } from 'vitest';
import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart } from './cartSlice';

describe('cartSlice', () => {
  let initialState;

  beforeEach(() => {
    initialState = [];
    localStorage.clear();
  });

  it('should handle addToCart', () => {
    const action = {
      type: addToCart.type,
      payload: {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        image: 'test.jpg',
        quantity: 2,
      },
    };

    const state = cartReducer(initialState, action);
    expect(state).toHaveLength(1);
    expect(state[0].id).toBe(1);
    expect(state[0].quantity).toBe(2);
  });

  it('should increase quantity if product already in cart', () => {
    const initialCart = [
      {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        image: 'test.jpg',
        quantity: 1,
      },
    ];

    const action = {
      type: addToCart.type,
      payload: {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        image: 'test.jpg',
        quantity: 1,
      },
    };

    const state = cartReducer(initialCart, action);
    expect(state).toHaveLength(1);
    expect(state[0].quantity).toBe(2);
  });

  it('should handle removeFromCart', () => {
    const initialCart = [
      { id: 1, name: 'Product 1', price: 99.99, image: 'test.jpg', quantity: 1 },
      { id: 2, name: 'Product 2', price: 49.99, image: 'test.jpg', quantity: 1 },
    ];

    const action = {
      type: removeFromCart.type,
      payload: 1,
    };

    const state = cartReducer(initialCart, action);
    expect(state).toHaveLength(1);
    expect(state[0].id).toBe(2);
  });

  it('should handle updateQuantity', () => {
    const initialCart = [
      { id: 1, name: 'Product 1', price: 99.99, image: 'test.jpg', quantity: 1 },
    ];

    const action = {
      type: updateQuantity.type,
      payload: {
        id: 1,
        quantity: 5,
      },
    };

    const state = cartReducer(initialCart, action);
    expect(state[0].quantity).toBe(5);
  });

  it('should remove product if quantity is 0', () => {
    const initialCart = [
      { id: 1, name: 'Product 1', price: 99.99, image: 'test.jpg', quantity: 1 },
    ];

    const action = {
      type: updateQuantity.type,
      payload: {
        id: 1,
        quantity: 0,
      },
    };

    const state = cartReducer(initialCart, action);
    expect(state).toHaveLength(0);
  });

  it('should handle clearCart', () => {
    const initialCart = [
      { id: 1, name: 'Product 1', price: 99.99, image: 'test.jpg', quantity: 1 },
      { id: 2, name: 'Product 2', price: 49.99, image: 'test.jpg', quantity: 1 },
    ];

    const action = { type: clearCart.type };

    const state = cartReducer(initialCart, action);
    expect(state).toHaveLength(0);
  });
});
