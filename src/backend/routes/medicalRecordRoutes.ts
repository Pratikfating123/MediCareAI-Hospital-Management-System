import { Router } from 'express';
import { getMedicalRecords, createMedicalRecord } from '../controllers/medicalRecordController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getMedicalRecords);
router.post('/', authorize('DOCTOR', 'ADMIN'), createMedicalRecord);

export default router;
