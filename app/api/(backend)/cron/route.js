import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// --- Step 2 & 3: Collect all Gemini API keys from .env into a list ---
function getAllApiKeys() {
  const keys = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('GEMINI') && value && value.trim() !== '') {
      keys.push(value.trim());
    }
  }
  return keys;
}

// --- Step 4: Cyclic key rotation state (module-level so it persists across calls in same instance) ---
let currentKeyIndex = 0;

// Call Gemini with cyclic key rotation.
// Returns { response, successfull, unsucessfull } where:
//   successfull = number of 200 OK calls (will always be 0 or 1 on success)
//   unsucessfull = number of failed API call attempts before a success (or before all keys exhausted)
async function callGeminiCyclic(prompt, keys) {
  if (!keys || keys.length === 0) {
    throw new Error('No Gemini API keys found in environment variables.');
  }

  let successfull = 0;
  let unsucessfull = 0;

  // Try each key starting from the current index, going cyclically
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

      // 200 OK — success
      successfull += 1;
      // Advance the cyclic pointer to the next key for the next exam call
      currentKeyIndex = (index + 1) % keys.length;
      console.log(`✅ Key index ${index} succeeded. Next key will be index ${currentKeyIndex}. [success: ${successfull}, failed: ${unsucessfull}]`);
      return { response, successfull, unsucessfull };

    } catch (err) {
      // Any non-200 response (429, 403, 404, 500, 503...) counts as unsucessfull
      unsucessfull += 1;
      const status = err?.status || err?.code;
      console.warn(`⚠️ Key index ${index} failed [status: ${status}]. unsucessfull count: ${unsucessfull}. Trying next key...`);

      // If 503 overloaded, wait 3s before trying next key
      if (status === 503) {
        await new Promise(r => setTimeout(r, 3000));
      }
      continue;
    }
  }

  // All keys exhausted without success
  throw Object.assign(
    new Error('All Gemini API keys failed or exceeded quota.'),
    { successfull, unsucessfull }
  );
}

export async function GET() {
  try {
    // --- Step 2 & 3: Fetch all keys ---
    const apiKeys = getAllApiKeys();
    console.log(`🔑 Found ${apiKeys.length} Gemini API keys.`);

    // --- Step 1: Fetch ALL exams from the database ---
    const { data: exams, error: fetchError } = await supabase
      .from('exams')
      .select('*')
      .order('last_checked_at', { ascending: true, nullsFirst: true });

    if (fetchError) throw fetchError;

    if (!exams || exams.length === 0) {
      return NextResponse.json({ message: 'No exams found in database.' });
    }

    console.log(`📋 Found ${exams.length} exams to process.`);

    const results = [];
    const errors = [];

    // --- Step 4 & 5: Process each exam cyclically, saving to DB instantly ---
    for (const exam of exams) {
      const prompt = `
        You are an expert at tracking government and bank IT recruitment exams in India.
        I need to know the latest update or expected notification date for this specific exam:
        Exam Name: ${exam.name}
        Category: ${exam.category}
        
        Please return a JSON response with the following format exactly:
        {
          "status": "Upcoming" | "Announced" | "Ongoing" | "Unknown",
          "expectedDate": "Month Year (e.g. Feb 2027) or specific date",
          "details": "A brief 1-2 sentence update on the current status."
        }
        
        Return ONLY valid JSON.
      `;

      try {
        // Call Gemini with cyclic key rotation — get back API call counts
        const { response, successfull, unsucessfull } = await callGeminiCyclic(prompt, apiKeys);
        const aiResult = JSON.parse(response.text);

        // --- Step 5: Save exam result to DB instantly ---
        const { error: updateError } = await supabase
          .from('exams')
          .update({
            status: aiResult.status,
            expected_date: aiResult.expectedDate,
            details: aiResult.details,
            last_checked_at: new Date().toISOString(),
            is_retrying: false,
          })
          .eq('id', exam.id);

        if (updateError) {
          console.error(`DB update error for ${exam.name}:`, updateError.message);
          errors.push({ exam: exam.name, error: updateError.message });
          continue;
        }

        // Log into check_history with actual API call counts
        await supabase.from('check_history').insert({
          exam_id: exam.id,
          status: aiResult.status,
          expected_date: aiResult.expectedDate,
          details: aiResult.details,
          is_correct: true,
          successfull,   // number of 200 calls (1 on success)
          unsucessfull,  // number of failed attempts before success
        });

        console.log(`✅ Saved: ${exam.name} → ${aiResult.status} [success calls: ${successfull}, failed calls: ${unsucessfull}]`);
        results.push({ exam: exam.name, result: aiResult, successfull, unsucessfull });

      } catch (err) {
        console.error(`❌ Failed for ${exam.name}:`, err.message);
        errors.push({ exam: exam.name, error: err.message });

        // Log the failure — attach call counts from the error object if available
        const successfull = err.successfull ?? 0;
        const unsucessfull = err.unsucessfull ?? apiKeys.length;

        await supabase.from('check_history').insert({
          exam_id: exam.id,
          status: 'Unknown',
          details: `Auto-check failed: ${err.message}`,
          is_correct: false,
          successfull,   // 0 — no call succeeded
          unsucessfull,  // total keys tried before giving up
        });

        continue;
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      failed: errors.length,
      results,
      errors,
    });

  } catch (error) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
