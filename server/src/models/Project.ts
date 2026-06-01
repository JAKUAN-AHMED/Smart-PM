import { Schema, model, Document, Types } from 'mongoose';

export const PROJECT_STATUSES = ['Active', 'Completed', 'OnHold'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  deadline: Date;
  status: ProjectStatus;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, default: '', maxlength: 2000 },
    deadline: { type: Date, required: true },
    status: { type: String, enum: PROJECT_STATUSES, default: 'Active', index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

projectSchema.index({ name: 'text', description: 'text' });

export const Project = model<IProject>('Project', projectSchema);
