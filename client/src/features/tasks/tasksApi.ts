import { api } from '@/app/api';
import { ApiResponse, Paginated, Task } from '@/types';

interface ListParams {
  search?: string;
  project?: string;
  assignee?: string;
  status?: string;
  priority?: string;
  deadlineStatus?: 'upcoming' | 'overdue';
  page?: number;
  limit?: number;
  sort?: 'latest' | 'deadline' | 'priority' | 'updated';
}

interface TaskInput {
  title: string;
  description?: string;
  project: string;
  assignee?: string | null;
  dueDate: string;
  priority?: string;
  status?: string;
}

export const tasksApi = api.injectEndpoints({
  endpoints: (build) => ({
    listTasks: build.query<Paginated<Task>, ListParams | void>({
      query: (params) => ({ url: '/tasks', params: params ?? {} }),
      providesTags: (res) =>
        res
          ? [
              ...res.data.map((t) => ({ type: 'Task' as const, id: t._id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
    }),
    getTask: build.query<ApiResponse<Task>, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Task', id }],
    }),
    createTask: build.mutation<ApiResponse<Task>, TaskInput>({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Task', id: 'LIST' },
        'Dashboard',
        'Activity',
        'Workload',
        'Project',
      ],
    }),
    updateTask: build.mutation<ApiResponse<Task>, { id: string; data: Partial<TaskInput> }>({
      query: ({ id, data }) => ({ url: `/tasks/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
        'Dashboard',
        'Activity',
        'Workload',
      ],
    }),
    updateTaskStatus: build.mutation<ApiResponse<Task>, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/tasks/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
        'Dashboard',
        'Activity',
        'Workload',
        'Project',
      ],
    }),
    deleteTask: build.mutation<ApiResponse<{ id: string }>, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Task', id: 'LIST' },
        'Dashboard',
        'Activity',
        'Workload',
        'Project',
      ],
    }),
    addComment: build.mutation<ApiResponse<Task>, { id: string; text: string }>({
      query: ({ id, text }) => ({ url: `/tasks/${id}/comments`, method: 'POST', body: { text } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Task', id }, 'Activity'],
    }),
  }),
});

export const {
  useListTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useAddCommentMutation,
} = tasksApi;
