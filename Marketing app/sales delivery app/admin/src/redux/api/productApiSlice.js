import { baseApi } from './baseApi';

export const productApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => '/product/list',
      providesTags: ['Product'],
      transformResponse: (response) => response.products || [],
    }),
    addProduct: builder.mutation({
      query: (formData) => ({
        url: '/product/add',
        method: 'POST',
        body: formData, // FormData is handled automatically by fetchBaseQuery
      }),
      invalidatesTags: ['Product'],
    }),
    removeProduct: builder.mutation({
      query: (id) => ({
        url: '/product/remove',
        method: 'POST',
        body: { id },
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const { useGetProductsQuery, useAddProductMutation, useRemoveProductMutation } = productApiSlice;
