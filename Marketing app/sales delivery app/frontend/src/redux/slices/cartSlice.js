import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: {}, // Shape matching context API: { itemId: { size: quantity } }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Override the entire cart (e.g. when syncing from backend on initial load)
    setCartItems: (state, action) => {
      state.cartItems = action.payload || {};
    },
    // Optimistic update for adding an item
    addLocalCartItem: (state, action) => {
      const { itemId, size } = action.payload;
      if (!state.cartItems[itemId]) {
        state.cartItems[itemId] = {};
      }
      state.cartItems[itemId][size] = (state.cartItems[itemId][size] || 0) + 1;
    },
    // Optimistic update for changing quantity
    updateLocalCartQuantity: (state, action) => {
      const { itemId, size, quantity } = action.payload;
      if (!state.cartItems[itemId]) {
        state.cartItems[itemId] = {};
      }
      state.cartItems[itemId][size] = quantity;
    },
    // Clear cart (e.g. on logout or successful order)
    clearLocalCart: (state) => {
      state.cartItems = {};
    }
  },
});

export const { setCartItems, addLocalCartItem, updateLocalCartQuantity, clearLocalCart } = cartSlice.actions;
export default cartSlice.reducer;
