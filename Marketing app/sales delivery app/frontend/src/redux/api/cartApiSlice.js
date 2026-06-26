import { baseApi } from './baseApi';
import { setCartItems } from '../slices/cartSlice';

export const cartApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => ({
        url: '/cart/get',
        method: 'POST',
      }),
      providesTags: ['Cart'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.cartData) {
            dispatch(setCartItems(data.cartData));
          }
        } catch (err) {}
      },
    }),
    addToCart: builder.mutation({
      query: ({ itemId, size }) => ({
        url: '/cart/add',
        method: 'POST',
        body: { itemId, size },
      }),
      // We rely on optimistic updates in the UI (cartSlice) for snappiness,
      // so we don't strictly need to invalidate the Cart tag here.
    }),
    updateCartQuantity: builder.mutation({
      query: ({ itemId, size, quantity }) => ({
        url: '/cart/update',
        method: 'POST',
        body: { itemId, size, quantity },
      }),
    }),
  }),
});

export const { useGetCartQuery, useAddToCartMutation, useUpdateCartQuantityMutation } = cartApiSlice;
