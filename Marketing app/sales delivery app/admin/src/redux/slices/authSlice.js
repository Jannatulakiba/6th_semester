import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    // baseApi will listen for 'auth/logout' when it receives a 401 response
    logout: (state) => {
      state.token = '';
      localStorage.removeItem('token');
    },
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;
