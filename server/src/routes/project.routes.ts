import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  projectMembersSchema,
  projectQuerySchema,
  updateProjectSchema,
} from '../validators/project.schema';
import * as ctrl from '../controllers/project.controller';

const router = Router();
router.use(requireAuth);

router.get('/', validate(projectQuerySchema, 'query'), ctrl.list);
router.get('/:id', ctrl.get);

router.post(
  '/',
  requireRole('Admin', 'ProjectManager'),
  validate(createProjectSchema),
  ctrl.create,
);
router.patch(
  '/:id',
  requireRole('Admin', 'ProjectManager'),
  validate(updateProjectSchema),
  ctrl.update,
);
router.delete('/:id', requireRole('Admin', 'ProjectManager'), ctrl.remove);

router.post(
  '/:id/members',
  requireRole('Admin', 'ProjectManager'),
  validate(projectMembersSchema),
  ctrl.addMembers,
);
router.delete('/:id/members/:memberId', requireRole('Admin', 'ProjectManager'), ctrl.removeMember);

export default router;
