import { Router } from 'express';
import { getApiKeys, testApiKey } from '../controllers/gemini.controller.js';

const router = Router();

router.get('/api-keys', getApiKeys);// Get Map[Name & keys] from .env
router.post('/api-keys/test', testApiKey);//Test Gemini APIs with Key-value in body


export default router;
