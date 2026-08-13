import { Router } from 'express';
import { getInventoryTransactions, createTransaction } from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getInventoryTransactions);
router.post('/transaction', authorize('PHARMACIST', 'ADMIN'), createTransaction);

export default router;
