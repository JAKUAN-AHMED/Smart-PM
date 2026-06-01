import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { logout } from '@/features/auth/authSlice';

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:5000/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithAuth: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && (result.error as FetchBaseQueryError).status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Auth', 'Project', 'Task', 'User', 'Activity', 'Dashboard', 'Workload'],
  endpoints: () => ({}),
});
