import { z } from 'zod';
import { PROJECT_STATUSES } from '../models/Project';

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional().default(''),
  deadline: z.coerce.date(),
  status: z.enum(PROJECT_STATUSES).optional().default('Active'),
  members: z.array(z.string()).optional().default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectMembersSchema = z.object({
  members: z.array(z.string()).min(1),
});

export const projectQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sort: z.enum(['latest', 'deadline', 'updated', 'name']).optional().default('latest'),
});
