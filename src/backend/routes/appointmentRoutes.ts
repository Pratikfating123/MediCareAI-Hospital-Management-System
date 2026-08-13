import { Router } from 'express';
import { getAppointments, createAppointment, updateAppointmentStatus } from '../controllers/appointmentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.patch('/:id/status', updateAppointmentStatus);

export default router;
