import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getAdminOverview } from '../controllers/adminController';
import { confirmAppointment } from '../controllers/appointmentController';

const router = Router();
router.get('/overview', requireAuth, requireAdmin, getAdminOverview);
router.patch('/appointments/:id/confirm', requireAuth, requireAdmin, confirmAppointment);

export default router;
