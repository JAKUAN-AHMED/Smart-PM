/* eslint-disable no-console */
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Activity } from '../models/Activity';

const addDays = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const seed = async (): Promise<void> => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  const [admin, pm, m1, m2, m3] = await User.create([
    { name: 'Admin User', email: 'admin@demo.com', password: 'demo1234', role: 'Admin', avatarColor: '#ef4444' },
    { name: 'Pat Manager', email: 'pm@demo.com', password: 'demo1234', role: 'ProjectManager', avatarColor: '#6366f1' },
    { name: 'John Member', email: 'john@demo.com', password: 'demo1234', role: 'Member', avatarColor: '#10b981' },
    { name: 'Sara Dev', email: 'sara@demo.com', password: 'demo1234', role: 'Member', avatarColor: '#f59e0b' },
    { name: 'Mike Designer', email: 'mike@demo.com', password: 'demo1234', role: 'Member', avatarColor: '#8b5cf6' },
  ]);

  const projects = await Project.create([
    {
      name: 'Website Redesign',
      description: 'Refresh the marketing site with a new design system.',
      deadline: addDays(20),
      status: 'Active',
      owner: pm._id,
      members: [m1._id, m2._id, m3._id],
    },
    {
      name: 'Mobile App',
      description: 'Build native mobile app for customer self-service.',
      deadline: addDays(45),
      status: 'Active',
      owner: pm._id,
      members: [m1._id, m2._id],
    },
    {
      name: 'Admin Dashboard',
      description: 'Internal admin console for support staff.',
      deadline: addDays(2),
      status: 'Active',
      owner: admin._id,
      members: [m2._id, m3._id],
    },
  ]);

  const [website, mobile, dash] = projects;

  await Task.create([
    {
      title: 'Setup design system tokens',
      project: website._id,
      assignee: m3._id,
      createdBy: pm._id,
      dueDate: addDays(3),
      priority: 'High',
      status: 'InProgress',
    },
    {
      title: 'Homepage hero implementation',
      project: website._id,
      assignee: m1._id,
      createdBy: pm._id,
      dueDate: addDays(7),
      priority: 'Medium',
      status: 'Todo',
    },
    {
      title: 'Migrate content from old CMS',
      project: website._id,
      assignee: m2._id,
      createdBy: pm._id,
      dueDate: addDays(10),
      priority: 'Low',
      status: 'Completed',
    },
    {
      title: 'Setup API gateway',
      project: mobile._id,
      assignee: m1._id,
      createdBy: pm._id,
      dueDate: addDays(5),
      priority: 'High',
      status: 'InProgress',
    },
    {
      title: 'Onboarding flow screens',
      project: mobile._id,
      assignee: m2._id,
      createdBy: pm._id,
      dueDate: addDays(14),
      priority: 'Medium',
      status: 'Todo',
    },
    {
      title: 'Role permissions matrix',
      project: dash._id,
      assignee: m3._id,
      createdBy: admin._id,
      dueDate: addDays(1),
      priority: 'High',
      status: 'InProgress',
    },
    {
      title: 'Audit log viewer',
      project: dash._id,
      assignee: m2._id,
      createdBy: admin._id,
      dueDate: addDays(2),
      priority: 'Medium',
      status: 'Todo',
    },
  ]);

  await Activity.create([
    { actor: pm._id, action: 'created', entity: 'project', entityId: website._id, project: website._id, message: `Project "${website.name}" created` },
    { actor: pm._id, action: 'created', entity: 'project', entityId: mobile._id, project: mobile._id, message: `Project "${mobile.name}" created` },
    { actor: admin._id, action: 'created', entity: 'project', entityId: dash._id, project: dash._id, message: `Project "${dash.name}" created` },
    { actor: pm._id, action: 'assigned', entity: 'task', project: website._id, message: 'Task "Setup design system tokens" assigned to Mike' },
    { actor: m2._id, action: 'completed', entity: 'task', project: website._id, message: 'Task "Migrate content from old CMS" marked as Completed' },
  ]);

  console.log('Seed complete.');
  console.log('Demo logins (password: demo1234):');
  console.log(' - admin@demo.com (Admin)');
  console.log(' - pm@demo.com (Project Manager)');
  console.log(' - john@demo.com (Member)');

  await disconnectDB();
};

seed().catch(async (e) => {
  console.error(e);
  await disconnectDB();
  process.exit(1);
});
