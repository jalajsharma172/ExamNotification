import { Router } from 'express';
import { runCron, runSummary } from '../controllers/cron.controller.js';
import { checkCronAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/cron', checkCronAuth, runCron);
router.get('/cron-summary', checkCronAuth, runSummary);

export default router;
