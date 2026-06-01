import { api } from '@/app/api';
import { Activity, ApiResponse } from '@/types';

export const activityApi = api.injectEndpoints({
  endpoints: (build) => ({
    listActivities: build.query<ApiResponse<Activity[]>, { limit?: number; project?: string } | void>({
      query: (params) => ({ url: '/activities', params: params ?? {} }),
      providesTags: ['Activity'],
    }),
  }),
});

export const { useListActivitiesQuery } = activityApi;
