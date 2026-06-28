import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || '',
  user: null, // Populated via login or profile fetch
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      if (action.payload.user) state.user = action.payload.user;
      if (action.payload.token) {
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      }
    },
    // The baseApi listens for this exact action type ('auth/logout') on 401s
    logout: (state) => {
      state.user = null;
      state.token = '';
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
