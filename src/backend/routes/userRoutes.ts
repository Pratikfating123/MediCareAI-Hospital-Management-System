import { Router } from 'express';
import { getUsers, createUser, toggleUserStatus } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), getUsers);
router.post('/', authorize('ADMIN'), createUser);
router.patch('/:id/toggle-status', authorize('ADMIN'), toggleUserStatus);

export default router;
