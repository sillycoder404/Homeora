import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  cancelAppointment,
  createGuestAppointment,
  createUserAppointment,
  guestAppointmentValidation,
  getMyAppointments,
  userAppointmentValidation,
} from '../controllers/appointmentController';

const router = Router();

router.post('/guest', guestAppointmentValidation, createGuestAppointment);
router.post('/', requireAuth, userAppointmentValidation, createUserAppointment);
router.get('/my', requireAuth, getMyAppointments);
router.patch('/:id/cancel', requireAuth, cancelAppointment);

export default router;
