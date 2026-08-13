import { Router } from 'express';
import { getPatients, getPatientById, createPatient } from '../controllers/patientController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'), getPatients);
router.get('/:id', getPatientById);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), createPatient);

export default router;
