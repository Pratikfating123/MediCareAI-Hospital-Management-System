import { Router } from 'express';
import { getAnalyticsSummary, getRevenueReport } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'DOCTOR'));

router.get('/analytics', getAnalyticsSummary);
router.get('/revenue', getRevenueReport);

export default router;
