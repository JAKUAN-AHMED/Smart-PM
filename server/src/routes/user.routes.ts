import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listUsers, workloadSummary } from '../controllers/user.controller';

const router = Router();
router.use(requireAuth);

router.get('/', listUsers);
router.get('/workload', workloadSummary);

export default router;
