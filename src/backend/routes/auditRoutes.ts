import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', getAuditLogs);

export default router;
