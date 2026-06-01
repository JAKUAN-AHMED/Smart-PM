import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/apiResponse';
import * as svc from '../services/project.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as {
    search?: string;
    status?: 'Active' | 'Completed' | 'OnHold';
    page: number;
    limit: number;
    sort: 'latest' | 'deadline' | 'updated' | 'name';
  };
  const result = await svc.listProjects({ ...q, userId: req.user!.id, role: req.user!.role });
  return ok(res, result.data, result.meta);
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  const project = await svc.getProject(req.params.id);
  return ok(res, project);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const project = await svc.createProject(req.body, req.user!.id);
  return created(res, project);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const project = await svc.updateProject(req.params.id, req.body, req.user!.id);
  return ok(res, project);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await svc.deleteProject(req.params.id, req.user!.id);
  return ok(res, result);
});

export const addMembers = asyncHandler(async (req: Request, res: Response) => {
  const project = await svc.addMembers(req.params.id, req.body.members, req.user!.id);
  return ok(res, project);
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const project = await svc.removeMember(req.params.id, req.params.memberId, req.user!.id);
  return ok(res, project);
});
