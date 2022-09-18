import { createSlice } from '@reduxjs/toolkit';

const collectionSlice = createSlice({
  name: 'productCollection',
  initialState: {
    data: [],
  },
  reducers: {
    addCollection: (state, actions) => {
      state.data = actions.payload;
    },
  },
});

export const { addCollection } = collectionSlice.actions;

export default collectionSlice.reducer;
