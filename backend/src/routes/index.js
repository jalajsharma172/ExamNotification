import { Router } from 'express';
import apiKeyRouter from './apiKey.routes.js';
import examRouter from './exam.routes.js';


const router = Router();

// Mount sub-routers (which are mapped prefix-free internally)
router.use('/', apiKeyRouter);//for gemini page
router.use('/', examRouter);//for home page


export default router;
