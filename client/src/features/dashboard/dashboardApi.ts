import { api } from '@/app/api';
import { ApiResponse, DashboardStats, Task } from '@/types';

interface ProjectProgress {
  _id: string;
  name: string;
  status: string;
  deadline: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

interface TrendPoint {
  date: string;
  count: number;
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    dashboardStats: build.query<ApiResponse<DashboardStats>, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
    projectProgress: build.query<ApiResponse<ProjectProgress[]>, void>({
      query: () => '/dashboard/project-progress',
      providesTags: ['Dashboard'],
    }),
    upcomingDeadlines: build.query<ApiResponse<Task[]>, void>({
      query: () => '/dashboard/upcoming-deadlines',
      providesTags: ['Dashboard'],
    }),
    highPriorityTasks: build.query<ApiResponse<Task[]>, void>({
      query: () => '/dashboard/high-priority',
      providesTags: ['Dashboard'],
    }),
    progressTrend: build.query<ApiResponse<TrendPoint[]>, void>({
      query: () => '/dashboard/progress-trend',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useDashboardStatsQuery,
  useProjectProgressQuery,
  useUpcomingDeadlinesQuery,
  useHighPriorityTasksQuery,
  useProgressTrendQuery,
} = dashboardApi;
