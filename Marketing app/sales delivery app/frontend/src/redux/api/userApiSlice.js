import { baseApi } from './baseApi';
import { setCredentials } from '../slices/authSlice';

export const userApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/user/profile',
      providesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.user) {
            dispatch(setCredentials({ user: data.user }));
          }
        } catch (err) {}
      },
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: '/user/profile',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.user) {
            dispatch(setCredentials({ user: data.user }));
          }
        } catch (err) {}
      },
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/user/password',
        method: 'PUT',
        body: data,
      }),
    }),
    getDashboard: builder.query({
      query: () => '/user/dashboard',
      providesTags: ['User', 'Order'],
    }),
  }),
});

export const { 
  useGetProfileQuery, 
  useUpdateProfileMutation, 
  useChangePasswordMutation,
  useGetDashboardQuery
} = userApiSlice;
