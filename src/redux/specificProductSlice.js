import { createSlice } from '@reduxjs/toolkit';

const specificProductSlice = createSlice({
  name: 'lstSpecificProduct',
  initialState: {
    data: [],
  },
  reducers: {
    addProducts: (state, actions) => {
      state.data = actions.payload;
    },
    deleteProduct(state, actions) {
      state.splice(state.indexOf(actions));
    },
  },
});

export const { addProducts, deleteProduct } = specificProductSlice.actions;

export default specificProductSlice.reducer;
