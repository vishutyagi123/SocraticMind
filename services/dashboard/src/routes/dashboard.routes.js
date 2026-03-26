import { Router } from 'express';
import { getOverview, getFingerprint, getJDCoverage, getLearningProgress } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/overview', getOverview);
router.get('/fingerprint', getFingerprint);
router.get('/jd-coverage', getJDCoverage);
router.get('/learning', getLearningProgress);

export { router as dashboardRoutes };
