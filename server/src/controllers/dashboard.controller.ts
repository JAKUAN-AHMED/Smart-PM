import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Activity } from '../models/Activity';

export const dashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const isMember = req.user!.role === 'Member';
  const memberProjects = isMember
    ? await Project.find({
        $or: [{ owner: req.user!.id }, { members: req.user!.id }],
      }).distinct('_id')
    : null;
  const projectFilter = memberProjects ? { _id: { $in: memberProjects } } : {};
  const taskFilter: Record<string, unknown> = memberProjects ? { project: { $in: memberProjects } } : {};

  const [totalProjects, projectsByStatus, totalTasks, tasksByStatus, tasksByPriority, overdueTasks] =
    await Promise.all([
      Project.countDocuments(projectFilter),
      Project.aggregate([
        { $match: projectFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.countDocuments(taskFilter),
      Task.aggregate([{ $match: taskFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: taskFilter }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.countDocuments({ ...taskFilter, dueDate: { $lt: new Date() }, status: { $ne: 'Completed' } }),
    ]);

  const tally = (rows: { _id: string; count: number }[]): Record<string, number> =>
    rows.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {} as Record<string, number>);

  const taskStatusMap = tally(tasksByStatus);
  const completed = taskStatusMap.Completed ?? 0;
  const pending = totalTasks - completed;

  return ok(res, {
    totals: {
      projects: totalProjects,
      tasks: totalTasks,
      completedTasks: completed,
      pendingTasks: pending,
      overdueTasks,
    },
    projectsByStatus: tally(projectsByStatus),
    tasksByStatus: taskStatusMap,
    tasksByPriority: tally(tasksByPriority),
  });
});

export const projectProgress = asyncHandler(async (req: Request, res: Response) => {
  const isMember = req.user!.role === 'Member';
  const match: Record<string, unknown> = {};
  if (isMember) {
    const ids = await Project.find({
      $or: [{ owner: req.user!.id }, { members: req.user!.id }],
    }).distinct('_id');
    match._id = { $in: ids };
  }

  const rows = await Project.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'project',
        as: 'tasks',
      },
    },
    {
      $project: {
        name: 1,
        status: 1,
        deadline: 1,
        totalTasks: { $size: '$tasks' },
        completedTasks: {
          $size: {
            $filter: {
              input: '$tasks',
              cond: { $eq: ['$$this.status', 'Completed'] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        progress: {
          $cond: [
            { $gt: ['$totalTasks', 0] },
            {
              $round: [
                { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                0,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { deadline: 1 } },
  ]);
  return ok(res, rows);
});

export const upcomingDeadlines = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const in14 = new Date();
  in14.setDate(in14.getDate() + 14);

  const filter: Record<string, unknown> = {
    dueDate: { $gte: now, $lte: in14 },
    status: { $ne: 'Completed' },
  };

  if (req.user!.role === 'Member') {
    const projectIds = await Project.find({
      $or: [{ owner: req.user!.id }, { members: req.user!.id }],
    }).distinct('_id');
    filter.project = { $in: projectIds };
  }

  const tasks = await Task.find(filter)
    .populate('project', 'name')
    .populate('assignee', 'name avatarColor')
    .sort({ dueDate: 1 })
    .limit(10);
  return ok(res, tasks);
});

export const highPriorityTasks = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = { priority: 'High', status: { $ne: 'Completed' } };
  if (req.user!.role === 'Member') {
    const ids = await Project.find({
      $or: [{ owner: req.user!.id }, { members: req.user!.id }],
    }).distinct('_id');
    filter.project = { $in: ids };
  }
  const tasks = await Task.find(filter)
    .populate('project', 'name')
    .populate('assignee', 'name avatarColor')
    .sort({ dueDate: 1 })
    .limit(10);
  return ok(res, tasks);
});

// Project progress trend: completed tasks per day, last 14 days
export const progressTrend = asyncHandler(async (_req: Request, res: Response) => {
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const rows = await Activity.aggregate([
    { $match: { action: 'completed', entity: 'task', createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return ok(res, rows.map((r) => ({ date: r._id, count: r.count })));
});
