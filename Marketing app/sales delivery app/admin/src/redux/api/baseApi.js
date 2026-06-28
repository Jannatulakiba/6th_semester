import axios from 'axios';
import { createApi } from '@reduxjs/toolkit/query/react';
import { logout, setToken } from '../slices/authSlice';

const BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'https://cloth-delivery-app.vercel.app') + '/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // crucial for refresh token cookies
});

const axiosBaseQuery = async (args, api, extraOptions) => {
  const { url, method, body, params, headers, responseType } = typeof args === 'string' ? { url: args } : args;

  const state = api.getState();
  const token = state.auth?.token;

  const commonHeaders = {};
  if (token) {
    commonHeaders['Authorization'] = `Bearer ${token}`;
    commonHeaders['token'] = token; // backward compatibility
  }

  try {
    const result = await axiosInstance({
      url,
      method: method || 'GET',
      data: body,
      params,
      headers: { ...commonHeaders, ...headers },
      responseType,
    });
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError;
    return {
      error: {
        status: err.response?.status || 500,
        data: err.response?.data || { message: err.message },
      },
    };
  }
};

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await axiosBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const isAuthEndpoint = typeof args === 'string'
      ? args.includes('/auth/admin')
      : args.url?.includes('/auth/admin');

    if (!isAuthEndpoint) {
      try {
        const refreshResult = await axiosInstance.post('/auth/refresh');
        const data = refreshResult.data;

        if (data.success && data.accessToken) {
          api.dispatch(setToken(data.accessToken));

          const retryArgs = typeof args === 'string' ? { url: args } : { ...args };
          if (!retryArgs.headers) retryArgs.headers = {};
          retryArgs.headers['Authorization'] = `Bearer ${data.accessToken}`;
          retryArgs.headers['token'] = data.accessToken;

          result = await axiosBaseQuery(retryArgs, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } catch (refreshError) {
        api.dispatch(logout());
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'Order'],
  endpoints: () => ({}),
});
