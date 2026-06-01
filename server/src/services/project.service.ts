import { FilterQuery, Types } from 'mongoose';
import { IProject, Project, ProjectStatus } from '../models/Project';
import { Task } from '../models/Task';
import { ApiError } from '../utils/ApiError';
import { logActivity } from './activity.service';

interface CreateInput {
  name: string;
  description?: string;
  deadline: Date;
  status?: ProjectStatus;
  members?: string[];
}

interface ListInput {
  search?: string;
  status?: ProjectStatus;
  page: number;
  limit: number;
  sort: 'latest' | 'deadline' | 'updated' | 'name';
  userId: string;
  role: string;
}

const sortMap: Record<ListInput['sort'], Record<string, 1 | -1>> = {
  latest: { createdAt: -1 },
  updated: { updatedAt: -1 },
  deadline: { deadline: 1 },
  name: { name: 1 },
};

const buildFilter = (input: Partial<ListInput>): FilterQuery<IProject> => {
  const filter: FilterQuery<IProject> = {};
  if (input.status) filter.status = input.status;
  if (input.search) {
    filter.$or = [
      { name: { $regex: input.search, $options: 'i' } },
      { description: { $regex: input.search, $options: 'i' } },
    ];
  }
  // Members can only see projects they belong to; admins/PMs see everything.
  if (input.role === 'Member' && input.userId) {
    filter.$or = [
      ...(filter.$or ?? []),
      { owner: new Types.ObjectId(input.userId) },
      { members: new Types.ObjectId(input.userId) },
    ];
  }
  return filter;
};

export const listProjects = async (input: ListInput) => {
  const filter = buildFilter(input);
  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .populate('owner', 'name email avatarColor')
    .populate('members', 'name email avatarColor')
    .sort(sortMap[input.sort])
    .skip((input.page - 1) * input.limit)
    .limit(input.limit);

  // Attach task counts
  const ids = projects.map((p) => p._id);
  const agg = await Task.aggregate([
    { $match: { project: { $in: ids } } },
    {
      $group: {
        _id: '$project',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
      },
    },
  ]);
  const taskMap = new Map(agg.map((a) => [a._id.toString(), a]));

  const enriched = projects.map((p) => {
    const stats = taskMap.get(p._id.toString()) ?? { total: 0, completed: 0 };
    const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    return { ...p.toObject(), totalTasks: stats.total, completedTasks: stats.completed, progress };
  });

  return {
    data: enriched,
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.limit)),
    },
  };
};

export const getProject = async (id: string) => {
  const project = await Project.findById(id)
    .populate('owner', 'name email avatarColor')
    .populate('members', 'name email avatarColor');
  if (!project) throw ApiError.notFound('Project not found');

  const taskStats = await Task.aggregate([
    { $match: { project: new Types.ObjectId(id) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
      },
    },
  ]);
  const stats = taskStats[0] ?? { total: 0, completed: 0 };
  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return { ...project.toObject(), totalTasks: stats.total, completedTasks: stats.completed, progress };
};

export const createProject = async (input: CreateInput, actorId: string) => {
  if (input.deadline.getTime() < Date.now() - 60 * 60 * 1000) {
    throw ApiError.badRequest('Please select a valid deadline.');
  }
  const project = await Project.create({
    ...input,
    owner: actorId,
    members: input.members ?? [],
  });
  await logActivity({
    actor: actorId,
    action: 'created',
    entity: 'project',
    entityId: project._id,
    project: project._id,
    message: `Project "${project.name}" created`,
  });
  return project;
};

export const updateProject = async (
  id: string,
  input: Partial<CreateInput>,
  actorId: string,
) => {
  if (input.deadline && input.deadline.getTime() < Date.now() - 60 * 60 * 1000) {
    throw ApiError.badRequest('Please select a valid deadline.');
  }
  const project = await Project.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!project) throw ApiError.notFound('Project not found');
  await logActivity({
    actor: actorId,
    action: 'updated',
    entity: 'project',
    entityId: project._id,
    project: project._id,
    message: `Project "${project.name}" updated`,
  });
  return project;
};

export const deleteProject = async (id: string, actorId: string) => {
  const project = await Project.findByIdAndDelete(id);
  if (!project) throw ApiError.notFound('Project not found');
  await Task.deleteMany({ project: project._id });
  await logActivity({
    actor: actorId,
    action: 'deleted',
    entity: 'project',
    entityId: project._id,
    message: `Project "${project.name}" deleted`,
  });
  return { id };
};

export const addMembers = async (projectId: string, memberIds: string[], actorId: string) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { members: { $each: memberIds } } },
    { new: true },
  ).populate('members', 'name email avatarColor');
  if (!project) throw ApiError.notFound('Project not found');
  await logActivity({
    actor: actorId,
    action: 'updated',
    entity: 'project',
    entityId: project._id,
    project: project._id,
    message: `${memberIds.length} member(s) added to "${project.name}"`,
  });
  return project;
};

export const removeMember = async (projectId: string, memberId: string, actorId: string) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { $pull: { members: memberId } },
    { new: true },
  ).populate('members', 'name email avatarColor');
  if (!project) throw ApiError.notFound('Project not found');
  await logActivity({
    actor: actorId,
    action: 'updated',
    entity: 'project',
    entityId: project._id,
    project: project._id,
    message: `Member removed from "${project.name}"`,
  });
  return project;
};
