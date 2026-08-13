import { Router } from 'express';
import { handleSymptomAssistant, handleDepartmentRecommender, handleAnalyticsAI } from '../controllers/aiController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/symptoms', handleSymptomAssistant);
router.post('/department-recommend', handleDepartmentRecommender);
router.post('/analytics-insights', handleAnalyticsAI);

export default router;
