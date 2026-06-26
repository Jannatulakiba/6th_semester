import { baseApi } from './baseApi';
import { setToken } from '../slices/authSlice';

export const authApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loginAdmin: builder.mutation({
      query: (credentials) => ({
        url: '/auth/admin',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.accessToken) {
            dispatch(setToken(data.accessToken));
          }
        } catch (err) {}
      },
    }),
  }),
});

export const { useLoginAdminMutation } = authApiSlice;
