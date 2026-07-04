import { Router } from 'express';
import { getApiKeys, testApiKey } from '../controllers/apiKey.controller.js';

const router = Router();

router.get('/api-keys', getApiKeys);// get Gemini Apis 
router.post('/api-keys/test', testApiKey);//test Gemini Apis with Key in body


export default router;
