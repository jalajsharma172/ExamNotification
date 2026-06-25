import { Router } from 'express';
import apiKeyRouter from './apiKey.routes.js';
import examRouter from './exam.routes.js';
import cronRouter from './cron.routes.js';

const router = Router();

// Mount sub-routers (which are mapped prefix-free internally)
router.use('/', apiKeyRouter);
router.use('/', examRouter);
router.use('/', cronRouter);

export default router;
