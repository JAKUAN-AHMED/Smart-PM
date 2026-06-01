import { z } from 'zod';
import { ROLES } from '../models/User';

export const signupSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6).max(128),
  role: z.enum(ROLES).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});
