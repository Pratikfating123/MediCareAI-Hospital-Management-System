import { Router } from 'express';
import { getDoctors, getDoctorById, updateDoctorAvailability } from '../controllers/doctorController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/:id/availability', authenticate, authorize('DOCTOR', 'ADMIN'), updateDoctorAvailability);

export default router;
