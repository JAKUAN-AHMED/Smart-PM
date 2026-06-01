export type Role = 'Admin' | 'ProjectManager' | 'Member';
export type ProjectStatus = 'Active' | 'Completed' | 'OnHold';
export type TaskStatus = 'Todo' | 'InProgress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  deadline: string;
  status: ProjectStatus;
  owner: User;
  members: User[];
  totalTasks?: number;
  completedTasks?: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: { _id: string; name: string } | string;
  assignee: User | null;
  createdBy: User;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  comments: Comment[];
  attachments: { _id: string; filename: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  actor: User;
  action: string;
  entity: string;
  entityId?: string;
  project?: { _id: string; name: string } | null;
  message: string;
  createdAt: string;
}

export interface DashboardStats {
  totals: {
    projects: number;
    tasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
  };
  projectsByStatus: Record<string, number>;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
}

export interface WorkloadRow {
  userId: string;
  name: string;
  email: string;
  avatarColor: string;
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  pending: number;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: unknown;
}
