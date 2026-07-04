import { Router } from 'express';
import { getExams } from '../controllers/exam.controller.js';
// import { checkCronAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Allow public or optionally protected seed endpoint

router.get('/exams', getExams);

export default router;
