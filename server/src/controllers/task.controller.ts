import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/apiResponse';
import * as svc from '../services/task.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as Omit<Parameters<typeof svc.listTasks>[0], 'userId' | 'role'>;
  const result = await svc.listTasks({
    ...query,
    userId: req.user!.id,
    role: req.user!.role,
  });
  return ok(res, result.data, result.meta);
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  const task = await svc.getTask(req.params.id);
  return ok(res, task);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const task = await svc.createTask(req.body, req.user!.id);
  return created(res, task);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const task = await svc.updateTask(req.params.id, req.body, req.user!.id);
  return ok(res, task);
});

export const setStatus = asyncHandler(async (req: Request, res: Response) => {
  const task = await svc.updateStatus(req.params.id, req.body.status, req.user!.id);
  return ok(res, task);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await svc.deleteTask(req.params.id, req.user!.id);
  return ok(res, result);
});

export const comment = asyncHandler(async (req: Request, res: Response) => {
  const task = await svc.addComment(req.params.id, req.body.text, req.user!.id);
  return ok(res, task);
});
