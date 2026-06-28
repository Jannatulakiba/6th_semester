import { baseApi } from './baseApi';

export const orderApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrders: builder.query({
      query: () => ({
        url: '/order/list',
        method: 'POST',
      }),
      providesTags: ['Order'],
      transformResponse: (response) => {
        // Reverse array here if needed, the previous hook did `return data.orders.reverse()`
        // But RTK query recommends mutating copies if needed or just returning
        return [...(response.orders || [])].reverse();
      },
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: '/order/status',
        method: 'POST',
        body: { orderId, status },
      }),
      // Using invalidatesTags makes it refetch automatically when a status changes
      invalidatesTags: ['Order'],
    }),
  }),
});

export const { useGetAllOrdersQuery, useUpdateOrderStatusMutation } = orderApiSlice;
