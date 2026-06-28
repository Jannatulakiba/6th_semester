import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  search: '',
  showSearch: false,
  currency: '$',
  delivery_fee: 10,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setShowSearch: (state, action) => {
      state.showSearch = action.payload;
    },
  },
});

export const { setSearch, setShowSearch } = uiSlice.actions;
export default uiSlice.reducer;
