import { baseApi } from './baseApi';

export const productApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: () => '/product/list?limit=0',
      providesTags: ['Product'],
      transformResponse: (response) => response.products,
    }),
    getPaginatedProducts: builder.query({
      query: (params) => ({
        url: '/product/list',
        params,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, ...filters } = queryArgs || {};
        return `${endpointName}-${JSON.stringify(filters)}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg?.page === 1) {
          return newItems;
        }
        if (newItems.products) {
          currentCache.products.push(...newItems.products);
          currentCache.page = newItems.page;
          currentCache.totalPages = newItems.totalPages;
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: ['Product'],
    }),
    rateProduct: builder.mutation({
      query: ({ productId, value }) => ({
        url: `/product/${productId}/rate`,
        method: 'POST',
        body: { value },
      }),
      invalidatesTags: ['Product'],
    }),
    addComment: builder.mutation({
      query: ({ productId, text }) => ({
        url: `/product/${productId}/comment`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: ['Product'],
    }),
    deleteComment: builder.mutation({
      query: ({ productId, commentId }) => ({
        url: `/product/${productId}/comment/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const { 
  useGetAllProductsQuery,
  useGetPaginatedProductsQuery, 
  useRateProductMutation, 
  useAddCommentMutation, 
  useDeleteCommentMutation 
} = productApiSlice;
