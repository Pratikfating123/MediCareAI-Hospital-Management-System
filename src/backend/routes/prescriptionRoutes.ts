import { Router } from 'express';
import { getPrescriptions, getPrescriptionById, createPrescription } from '../controllers/prescriptionController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.post('/', authorize('DOCTOR', 'ADMIN'), createPrescription);

export default router;
