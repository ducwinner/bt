import { configureStore } from '@reduxjs/toolkit';
import specificProductSlice from './specificProductSlice';
import collectionSlice from './collectionSlice';
import productTags from './productTagSlice';

const rootReducer = {
  specificProduct: specificProductSlice,
  collections: collectionSlice,
  tags: productTags,
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
