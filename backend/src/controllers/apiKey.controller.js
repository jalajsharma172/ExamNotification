import { testKey } from '../services/gemini.service.js';

/**
 * Controller to handle fetching the names of all GEMINI keys in the environment.
 */
export async function getApiKeys(req, res, next) {
  try {
    const keys = [];
    for (const [name, value] of Object.entries(process.env)) {
      if (name.startsWith('GEMINI') && value && value.trim() !== '') {
        keys.push({ name: name.trim(), key: value.trim() });
      }
    }
    return res.json({ success: true, keys });
  } catch (error) {
    return next(error);
  }
}

/**
 * Controller to handle testing a specific Gemini API key.
 */
export async function testApiKey(req, res, next) {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ success: false, error: 'Key is required' });
    }

    const result = await testKey(key);
    if (!result.ok) {
      return res.json({
        success: false,
        status: result.status,
        error: result.data.error?.message || 'Unknown error'
      });
    }
    
    return res.json({ success: true, status: result.status });
  } catch (error) {
    return next(error);
  }
}
