import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listActivities } from '../controllers/activity.controller';

const router = Router();
router.use(requireAuth);
router.get('/', listActivities);

export default router;
