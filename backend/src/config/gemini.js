import env from './env.js';

/**
 * Retrieves all Gemini API keys matching the prefix `GEMINI` from environment variables.
 */
export function getAllApiKeys() {
  const keys = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('GEMINI') && value && value.trim() !== '') {
      keys.push(value.trim());
    }
  }
  return keys;
}

/**
 * Retrieves the specific keys used for the summary fallback pipeline.
 */
export function getSummaryApiKeys() {
  return [
    process.env.GEMINI_API_KEYForConsisingData,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7
  ].filter(Boolean).map(key => key.trim());
}
