import { api } from '@/app/api';
import { ApiResponse, Paginated, Project } from '@/types';

interface ListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'deadline' | 'updated' | 'name';
}

interface ProjectInput {
  name: string;
  description?: string;
  deadline: string;
  status?: string;
  members?: string[];
}

export const projectsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listProjects: build.query<Paginated<Project>, ListParams | void>({
      query: (params) => ({ url: '/projects', params: params ?? {} }),
      providesTags: (res) =>
        res
          ? [
              ...res.data.map((p) => ({ type: 'Project' as const, id: p._id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),
    getProject: build.query<ApiResponse<Project>, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Project', id }],
    }),
    createProject: build.mutation<ApiResponse<Project>, ProjectInput>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }, 'Dashboard', 'Activity'],
    }),
    updateProject: build.mutation<ApiResponse<Project>, { id: string; data: Partial<ProjectInput> }>({
      query: ({ id, data }) => ({ url: `/projects/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
        'Activity',
      ],
    }),
    deleteProject: build.mutation<ApiResponse<{ id: string }>, string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }, 'Task', 'Dashboard', 'Activity'],
    }),
    addProjectMembers: build.mutation<ApiResponse<Project>, { id: string; members: string[] }>({
      query: ({ id, members }) => ({
        url: `/projects/${id}/members`,
        method: 'POST',
        body: { members },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Project', id }, 'Activity'],
    }),
    removeProjectMember: build.mutation<ApiResponse<Project>, { id: string; memberId: string }>({
      query: ({ id, memberId }) => ({
        url: `/projects/${id}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Project', id }, 'Activity'],
    }),
  }),
});

export const {
  useListProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddProjectMembersMutation,
  useRemoveProjectMemberMutation,
} = projectsApi;
