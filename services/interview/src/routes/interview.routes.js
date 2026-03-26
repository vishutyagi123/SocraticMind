import { Router } from 'express';
import { startInterview, answerQuestion, finishInterview, getInterview } from '../controllers/interview.controller.js';

const router = Router();

router.post('/start', startInterview);
router.post('/:id/answer', answerQuestion);
router.post('/:id/end', finishInterview);
router.get('/:id', getInterview);

export { router as interviewRoutes };
