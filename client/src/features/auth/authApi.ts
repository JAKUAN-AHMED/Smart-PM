import { api } from '@/app/api';
import { ApiResponse, User } from '@/types';

interface AuthPayload {
  user: User;
  token: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<ApiResponse<AuthPayload>, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    signup: build.mutation<
      ApiResponse<AuthPayload>,
      { name: string; email: string; password: string; role?: string }
    >({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
    }),
    me: build.query<ApiResponse<User>, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useMeQuery } = authApi;
