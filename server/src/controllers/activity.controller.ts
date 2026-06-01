import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';
import { Activity } from '../models/Activity';

export const listActivities = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit ?? 10), 50);
  const project = req.query.project as string | undefined;
  const filter: Record<string, unknown> = {};
  if (project) filter.project = project;

  const activities = await Activity.find(filter)
    .populate('actor', 'name email avatarColor')
    .populate('project', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
  return ok(res, activities);
});
