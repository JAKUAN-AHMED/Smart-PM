import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  commentSchema,
  createTaskSchema,
  taskQuerySchema,
  updateStatusSchema,
  updateTaskSchema,
} from '../validators/task.schema';
import * as ctrl from '../controllers/task.controller';

const router = Router();
router.use(requireAuth);

router.get('/', validate(taskQuerySchema, 'query'), ctrl.list);
router.get('/:id', ctrl.get);

router.post('/', requireRole('Admin', 'ProjectManager'), validate(createTaskSchema), ctrl.create);
router.patch('/:id', validate(updateTaskSchema), ctrl.update);
router.patch('/:id/status', validate(updateStatusSchema), ctrl.setStatus);
router.delete('/:id', requireRole('Admin', 'ProjectManager'), ctrl.remove);

router.post('/:id/comments', validate(commentSchema), ctrl.comment);

export default router;
