import { Schema, model, Document, Types } from 'mongoose';

export const ACTIVITY_ACTIONS = [
  'created',
  'updated',
  'deleted',
  'status_changed',
  'completed',
  'commented',
  'assigned',
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export const ACTIVITY_ENTITIES = ['project', 'task', 'user'] as const;
export type ActivityEntity = (typeof ACTIVITY_ENTITIES)[number];

export interface IActivity extends Document {
  _id: Types.ObjectId;
  actor: Types.ObjectId;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: Types.ObjectId;
  project?: Types.ObjectId | null;
  message: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: ACTIVITY_ACTIONS, required: true },
    entity: { type: String, enum: ACTIVITY_ENTITIES, required: true },
    entityId: { type: Schema.Types.ObjectId },
    project: { type: Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activitySchema.index({ createdAt: -1 });

export const Activity = model<IActivity>('Activity', activitySchema);
