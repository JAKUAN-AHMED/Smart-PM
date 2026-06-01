import { FilterQuery, Types } from 'mongoose';
import { ITask, Task, TaskPriority, TaskStatus } from '../models/Task';
import { Project } from '../models/Project';
import { ApiError } from '../utils/ApiError';
import { logActivity } from './activity.service';

interface CreateInput {
  title: string;
  description?: string;
  project: string;
  assignee?: string | null;
  dueDate: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
}

interface ListInput {
  search?: string;
  project?: string;
  assignee?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadlineStatus?: 'upcoming' | 'overdue';
  page: number;
  limit: number;
  sort: 'latest' | 'deadline' | 'priority' | 'updated';
  userId: string;
  role: string;
}

const priorityOrder = { High: 0, Medium: 1, Low: 2 } as const;

const sortMap = (
  sort: ListInput['sort'],
): { sortStage: Record<string, 1 | -1>; needsPriorityField: boolean } => {
  switch (sort) {
    case 'deadline':
      return { sortStage: { dueDate: 1 }, needsPriorityField: false };
    case 'updated':
      return { sortStage: { updatedAt: -1 }, needsPriorityField: false };
    case 'priority':
      return { sortStage: { _priorityOrder: 1, dueDate: 1 }, needsPriorityField: true };
    case 'latest':
    default:
      return { sortStage: { createdAt: -1 }, needsPriorityField: false };
  }
};

const assertNotPast = (date: Date): void => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (date.getTime() < startOfToday.getTime()) {
    throw ApiError.badRequest('Please select a valid deadline.');
  }
};

export const listTasks = async (input: ListInput) => {
  const filter: FilterQuery<ITask> = {};
  if (input.project) filter.project = new Types.ObjectId(input.project);
  if (input.assignee) filter.assignee = new Types.ObjectId(input.assignee);
  if (input.status) filter.status = input.status;
  if (input.priority) filter.priority = input.priority;
  if (input.search) {
    filter.$or = [
      { title: { $regex: input.search, $options: 'i' } },
      { description: { $regex: input.search, $options: 'i' } },
    ];
  }
  if (input.deadlineStatus === 'overdue') {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $ne: 'Completed' } as unknown as TaskStatus;
  } else if (input.deadlineStatus === 'upcoming') {
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    filter.dueDate = { $gte: new Date(), $lte: in7 };
    filter.status = { $ne: 'Completed' } as unknown as TaskStatus;
  }

  // Members only see tasks in projects they're part of (or assigned to them)
  if (input.role === 'Member') {
    const projectIds = await Project.find({
      $or: [{ owner: input.userId }, { members: input.userId }],
    }).distinct('_id');
    filter.project = { $in: projectIds } as unknown as Types.ObjectId;
  }

  const total = await Task.countDocuments(filter);
  const { sortStage, needsPriorityField } = sortMap(input.sort);

  let query = Task.find(filter)
    .populate('assignee', 'name email avatarColor')
    .populate('project', 'name status')
    .populate('createdBy', 'name email avatarColor');

  if (needsPriorityField) {
    // Use aggregation for priority sort
    const pipeline = [
      { $match: filter },
      {
        $addFields: {
          _priorityOrder: {
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'High'] }, then: 0 },
                { case: { $eq: ['$priority', 'Medium'] }, then: 1 },
                { case: { $eq: ['$priority', 'Low'] }, then: 2 },
              ],
              default: 3,
            },
          },
        },
      },
      { $sort: sortStage },
      { $skip: (input.page - 1) * input.limit },
      { $limit: input.limit },
      { $lookup: { from: 'users', localField: 'assignee', foreignField: '_id', as: 'assignee' } },
      { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'projects', localField: 'project', foreignField: '_id', as: 'project' } },
      { $unwind: '$project' },
    ];
    const tasks = await Task.aggregate(pipeline);
    return {
      data: tasks,
      meta: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / input.limit)),
      },
    };
  }

  query = query.sort(sortStage).skip((input.page - 1) * input.limit).limit(input.limit);
  const tasks = await query;
  return {
    data: tasks,
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.limit)),
    },
  };
};

export const getTask = async (id: string) => {
  const task = await Task.findById(id)
    .populate('assignee', 'name email avatarColor')
    .populate('project', 'name status')
    .populate('createdBy', 'name email avatarColor')
    .populate('comments.author', 'name email avatarColor');
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

const ensureNotDuplicate = async (
  projectId: string,
  title: string,
  excludeId?: string,
): Promise<void> => {
  const query: FilterQuery<ITask> = { project: projectId, title };
  if (excludeId) query._id = { $ne: excludeId };
  const existing = await Task.findOne(query).collation({ locale: 'en', strength: 2 });
  if (existing) throw ApiError.conflict('This task already exists in the project.');
};

export const createTask = async (input: CreateInput, actorId: string) => {
  assertNotPast(input.dueDate);
  const project = await Project.findById(input.project);
  if (!project) throw ApiError.notFound('Project not found');
  if (project.status === 'Completed') {
    throw ApiError.badRequest('Cannot add tasks to a completed project.');
  }
  await ensureNotDuplicate(input.project, input.title);

  const task = await Task.create({
    ...input,
    createdBy: actorId,
    assignee: input.assignee ?? null,
  });
  await logActivity({
    actor: actorId,
    action: 'created',
    entity: 'task',
    entityId: task._id,
    project: task.project,
    message: `Task "${task.title}" created`,
  });
  return task;
};

export const updateTask = async (
  id: string,
  input: Partial<CreateInput>,
  actorId: string,
) => {
  const current = await Task.findById(id);
  if (!current) throw ApiError.notFound('Task not found');

  if (current.status === 'Completed' && input.assignee !== undefined && input.assignee !== current.assignee?.toString()) {
    throw ApiError.badRequest('Completed tasks cannot be reassigned.');
  }

  if (input.dueDate) assertNotPast(input.dueDate);

  if (input.title && input.title !== current.title) {
    await ensureNotDuplicate(current.project.toString(), input.title, id);
  }

  Object.assign(current, input);
  await current.save();

  await logActivity({
    actor: actorId,
    action: 'updated',
    entity: 'task',
    entityId: current._id,
    project: current.project,
    message: `Task "${current.title}" updated`,
  });
  return current;
};

export const updateStatus = async (id: string, status: TaskStatus, actorId: string) => {
  const task = await Task.findById(id);
  if (!task) throw ApiError.notFound('Task not found');
  task.status = status;
  await task.save();
  await logActivity({
    actor: actorId,
    action: status === 'Completed' ? 'completed' : 'status_changed',
    entity: 'task',
    entityId: task._id,
    project: task.project,
    message: `Task "${task.title}" marked as ${status}`,
  });
  return task;
};

export const deleteTask = async (id: string, actorId: string) => {
  const task = await Task.findByIdAndDelete(id);
  if (!task) throw ApiError.notFound('Task not found');
  await logActivity({
    actor: actorId,
    action: 'deleted',
    entity: 'task',
    entityId: task._id,
    project: task.project,
    message: `Task "${task.title}" deleted`,
  });
  return { id };
};

export const addComment = async (taskId: string, text: string, actorId: string) => {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Task not found');
  task.comments.push({ author: new Types.ObjectId(actorId), text } as never);
  await task.save();
  await logActivity({
    actor: actorId,
    action: 'commented',
    entity: 'task',
    entityId: task._id,
    project: task.project,
    message: `Comment added on "${task.title}"`,
  });
  return task.populate('comments.author', 'name email avatarColor');
};
