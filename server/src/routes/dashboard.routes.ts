import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/dashboard.controller';

const router = Router();
router.use(requireAuth);

router.get('/stats', ctrl.dashboardStats);
router.get('/project-progress', ctrl.projectProgress);
router.get('/upcoming-deadlines', ctrl.upcomingDeadlines);
router.get('/high-priority', ctrl.highPriorityTasks);
router.get('/progress-trend', ctrl.progressTrend);

export default router;
