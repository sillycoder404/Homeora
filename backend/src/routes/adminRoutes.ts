import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getAdminOverview } from '../controllers/adminController';

const router = Router();
router.get('/overview', requireAuth, requireAdmin, getAdminOverview);

export default router;
