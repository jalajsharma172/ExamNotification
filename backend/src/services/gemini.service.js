import { GoogleGenAI } from '@google/genai';
import { getAllApiKeys, getSummaryApiKeys } from '../config/gemini.js';

let currentKeyIndex = 0;

/**
 * Tests an individual Gemini API key to check validity.
 */
export async function testKey(key) {
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
  return { ok: response.ok, status: response.status, data };
}

/**
 * Calls Gemini using cyclic key rotation.
 */
export async function callGeminiCyclic(prompt) {
  const keys = getAllApiKeys();
  if (!keys || keys.length === 0) {
    throw new Error('No Gemini API keys found in environment variables.');
  }

  let successfull = 0;
  let unsucessfull = 0;

  for (let i = 0; i < keys.length; i++) {
    const index = (currentKeyIndex + i) % keys.length;
    const apiKey = keys[index];

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      successfull += 1;
      currentKeyIndex = (index + 1) % keys.length;
      console.log(`✅ Key index ${index} succeeded. Next key will be index ${currentKeyIndex}. [success: ${successfull}, failed: ${unsucessfull}]`);
      return { response, successfull, unsucessfull };

    } catch (err) {
      unsucessfull += 1;
      const status = err?.status || err?.code;
      console.warn(`⚠️ Key index ${index} failed [status: ${status}]. unsucessfull count: ${unsucessfull}. Trying next key...`);

      if (status === 503) {
        await new Promise(r => setTimeout(r, 3000));
      }
      continue;
    }
  }

  throw Object.assign(
    new Error('All Gemini API keys failed or exceeded quota.'),
    { successfull, unsucessfull }
  );
}

/**
 * Calls Gemini using summary key fallback system.
 */
export async function callGeminiWithFallback(prompt) {
  const keys = getSummaryApiKeys();
  if (!keys || keys.length === 0) {
    throw new Error("No GEMINI API keys found in environment variables.");
  }

  for (const apiKey of keys) {
    const ai = new GoogleGenAI({ apiKey });
    
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        return response;
      } catch (err) {
        const status = err?.status || err?.code;
        if (status === 429) {
          console.warn('API Key rate limited. Falling back to next key...');
          break; 
        }
        if (status === 503 && attempt === 0) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        throw err;
      }
    }
  }
  throw new Error("All API keys failed or exceeded quota.");
}
