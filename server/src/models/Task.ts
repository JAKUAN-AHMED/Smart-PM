import { Schema, model, Document, Types } from 'mongoose';

export const TASK_STATUSES = ['Todo', 'InProgress', 'Completed'] as const;
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface IComment {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IAttachment {
  _id: Types.ObjectId;
  filename: string;
  url: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  project: Types.ObjectId;
  assignee: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  comments: IComment[];
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const attachmentSchema = new Schema<IAttachment>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'uploadedAt', updatedAt: false } },
);

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    description: { type: String, default: '', maxlength: 4000 },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'Medium', index: true },
    status: { type: String, enum: TASK_STATUSES, default: 'Todo', index: true },
    comments: [commentSchema],
    attachments: [attachmentSchema],
  },
  { timestamps: true },
);

// Enforce unique title within a project (case-insensitive)
taskSchema.index(
  { project: 1, title: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);

taskSchema.index({ title: 'text', description: 'text' });

export const Task = model<ITask>('Task', taskSchema);
