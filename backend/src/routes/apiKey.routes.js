import { Router } from 'express';
import { getApiKeys, testApiKey } from '../controllers/apiKey.controller.js';

const router = Router();

router.get('/api-keys', getApiKeys);
router.post('/api-keys/test', testApiKey);
router.post('/gemini-keys/test', testApiKey);

export default router;
