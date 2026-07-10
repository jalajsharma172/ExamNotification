import { Router } from 'express';
import { getExams } from '../controllers/exam.controller.js';
import {AutoRun} from '../services/autoruncrons.js'
// import { checkCronAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Allow public or optionally protected seed endpoint

router.get('/exams', getExams);
route.get('/autorun',AutoRun);
export default router;
