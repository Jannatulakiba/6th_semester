import { baseApi } from './baseApi';
import { clearLocalCart } from '../slices/cartSlice';

export const orderApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserOrders: builder.query({
      query: (params) => ({
        url: '/order/userorders',
        method: 'POST',
        params,
      }),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (arg?.page === 1) return newItems;
        if (newItems.items && newItems.items.length > 0) {
          currentCache.items.push(...newItems.items);
          currentCache.page = newItems.page;
          currentCache.totalPages = newItems.totalPages;
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: ['Order'],
      transformResponse: (response) => {
        if (!response.success) return { items: [], page: 1, totalPages: 1 };
        
        const items = [];
        response.orders.forEach((order) => {
          order.items.forEach((item) => {
            items.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
            });
          });
        });
        
        // Orders are already sorted by date descending from the backend
        return { 
          items, 
          page: response.page, 
          totalPages: response.totalPages 
        };
      },
    }),
    placeOrder: builder.mutation({
      query: (orderData) => ({
        url: '/order/place',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Cart'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(clearLocalCart());
        } catch (err) {}
      },
    }),
    placeOrderStripe: builder.mutation({
      query: (orderData) => ({
        url: '/order/stripe',
        method: 'POST',
        body: orderData,
      }),
    }),
    verifyStripe: builder.mutation({
      query: ({ success, orderId }) => ({
        url: '/order/verifyStripe',
        method: 'POST',
        body: { success, orderId },
      }),
      invalidatesTags: ['Order', 'Cart'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(clearLocalCart());
        } catch (err) {}
      },
    }),
  }),
});

export const { 
  useGetUserOrdersQuery, 
  usePlaceOrderMutation, 
  usePlaceOrderStripeMutation, 
  useVerifyStripeMutation 
} = orderApiSlice;
