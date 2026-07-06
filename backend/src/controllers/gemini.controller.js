import config from '../config/config.js';
// console.log(config.geminiApiKeyMap);
  /**
   * Get Map[Name & keys] from .env
   */
  export async function getApiKeys(req, res, next) {
    return res.json({
      success: true,
      keys: config.geminiApiKeyMap,
    });
  }
  
/**
 * Manual Gemini Api keys test
 */
export async function testApiKey(req, res, next) {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ success: false, error: 'Key is required' });
    }

     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "hi" }] }]
        })
      });
      
      const data = await response.json();
    
    return res.json({ success: response.ok, status: result.status ,error: result.data.error?.message || 'Unknown error' });
  } catch (error) {
    return next(error);
  }
}
