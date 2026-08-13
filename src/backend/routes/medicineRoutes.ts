import { Router } from 'express';
import { getMedicines, createMedicine, updateMedicine, getCategoriesAndSuppliers } from '../controllers/medicineController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getMedicines);
router.get('/meta/categories-suppliers', getCategoriesAndSuppliers);
router.post('/', authorize('PHARMACIST', 'ADMIN'), createMedicine);
router.put('/:id', authorize('PHARMACIST', 'ADMIN'), updateMedicine);

export default router;
