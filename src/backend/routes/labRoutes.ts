import { Router } from 'express';
import { getLabTests, createLabTest, updateLabTestStatus } from '../controllers/labController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getLabTests);
router.post('/', authorize('DOCTOR', 'ADMIN'), createLabTest);
router.patch('/:id/status', authorize('LAB_STAFF', 'DOCTOR', 'ADMIN'), updateLabTestStatus);

export default router;
