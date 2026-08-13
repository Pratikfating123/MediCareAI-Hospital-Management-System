import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markRead);
router.post('/read-all', markAllRead);

export default router;
