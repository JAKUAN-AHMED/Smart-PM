import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from '../models/Task';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(4000).optional().default(''),
  project: objectId,
  assignee: objectId.nullable().optional(),
  dueDate: z.coerce.date(),
  priority: z.enum(TASK_PRIORITIES).optional().default('Medium'),
  status: z.enum(TASK_STATUSES).optional().default('Todo'),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  project: objectId.optional(),
  assignee: objectId.optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  deadlineStatus: z.enum(['upcoming', 'overdue']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sort: z.enum(['latest', 'deadline', 'priority', 'updated']).optional().default('latest'),
});

export const updateStatusSchema = z.object({
  status: z.enum(TASK_STATUSES),
});

export const commentSchema = z.object({
  text: z.string().min(1).max(1000),
});
