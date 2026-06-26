import { baseApi } from './baseApi';

export const dashboardApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Dashboard', 'Product', 'User'],
    }),
    getDashboardUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['User'],
      transformResponse: (res) => res.users || [],
    }),
    getDashboardChartStats: builder.query({
      query: () => '/admin/chart-stats',
      providesTags: ['Dashboard'],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Dashboard'],
    }),
    deleteProductAdmin: builder.mutation({
      query: (productId) => ({
        url: `/admin/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product', 'Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetDashboardUsersQuery,
  useGetDashboardChartStatsQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useDeleteProductAdminMutation,
} = dashboardApiSlice;
