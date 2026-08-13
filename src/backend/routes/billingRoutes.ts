import { Router } from 'express';
import { getBills, getBillById, createBill, recordPayment } from '../controllers/billingController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getBills);
router.get('/:id', getBillById);
router.post('/', authorize('RECEPTIONIST', 'ADMIN'), createBill);
router.post('/:id/payment', authorize('RECEPTIONIST', 'PATIENT', 'ADMIN'), recordPayment);

export default router;
