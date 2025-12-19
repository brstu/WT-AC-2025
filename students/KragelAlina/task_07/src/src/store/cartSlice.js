import { createSlice } from '@reduxjs/toolkit';

const getInitialCart = () => {
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: getInitialCart(),
  reducers: {
    addToCart: (state, action) => {
      const { id, name, price, image, quantity = 1 } = action.payload;
      const existingItem = state.find(item => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.push({
          id,
          name,
          price,
          image,
          quantity,
        });
      }

      localStorage.setItem('cart', JSON.stringify(state));
    },

    removeFromCart: (state, action) => {
      const filtered = state.filter(item => item.id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(filtered));
      return filtered;
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.find(item => item.id === id);

      if (item) {
        if (quantity <= 0) {
          const filtered = state.filter(item => item.id !== id);
          localStorage.setItem('cart', JSON.stringify(filtered));
          return filtered;
        } else {
          item.quantity = quantity;
        }
      }

      localStorage.setItem('cart', JSON.stringify(state));
    },

    clearCart: (state) => {
      localStorage.removeItem('cart');
      return [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
