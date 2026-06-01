import { Types } from 'mongoose';
import { Activity, ActivityAction, ActivityEntity } from '../models/Activity';

interface LogInput {
  actor: string | Types.ObjectId;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string | Types.ObjectId;
  message: string;
  project?: string | Types.ObjectId | null;
}

export const logActivity = async (input: LogInput): Promise<void> => {
  try {
    await Activity.create({
      actor: input.actor,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      message: input.message,
      project: input.project ?? null,
    });
  } catch (err) {
    // Never let logging break the main flow
    // eslint-disable-next-line no-console
    console.error('[activity] failed to log', err);
  }
};
