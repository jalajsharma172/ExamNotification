import { Router } from 'express';
import { runCron, runSummary } from '../controllers/cron.controller.js';
import { checkCronAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/cron', runCron);
router.get('/cron-summary', runSummary);

export default router;
