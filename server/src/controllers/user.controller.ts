import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';
import { User } from '../models/User';
import { Task } from '../models/Task';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query as { search?: string };
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter).sort({ name: 1 });
  return ok(res, users);
});

export const workloadSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await Task.aggregate([
    { $match: { assignee: { $ne: null } } },
    {
      $group: {
        _id: '$assignee',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'InProgress'] }, 1, 0] } },
        todo: { $sum: { $cond: [{ $eq: ['$status', 'Todo'] }, 1, 0] } },
      },
    },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        avatarColor: '$user.avatarColor',
        total: 1,
        completed: 1,
        inProgress: 1,
        todo: 1,
        pending: { $add: ['$todo', '$inProgress'] },
      },
    },
    { $sort: { total: -1 } },
  ]);
  return ok(res, summary);
});
