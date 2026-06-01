import { Router } from 'express';
import { login, me, signup } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { loginSchema, signupSchema } from '../validators/auth.schema';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', requireAuth, me);

export default router;
