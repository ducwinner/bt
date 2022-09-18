import { createSlice } from '@reduxjs/toolkit';

const productTags = createSlice({
  name: 'tags',
  initialState: {
    data: [],
  },
  reducers: {
    addTags: (state, actions) => {
      state.data = actions.payload;
    },
  },
});

export const { addTags } = productTags.actions;

export default productTags.reducer;
