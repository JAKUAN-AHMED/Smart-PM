import { api } from '@/app/api';
import { ApiResponse, User, WorkloadRow } from '@/types';

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<ApiResponse<User[]>, { search?: string } | void>({
      query: (params) => ({ url: '/users', params: params ?? {} }),
      providesTags: ['User'],
    }),
    workload: build.query<ApiResponse<WorkloadRow[]>, void>({
      query: () => '/users/workload',
      providesTags: ['Workload'],
    }),
  }),
});

export const { useListUsersQuery, useWorkloadQuery } = usersApi;
