import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Helper with key rotation fallback
async function callGeminiWithFallback(prompt, keys) {
  for (const apiKey of keys) {
    const ai = new GoogleGenAI({ apiKey });
    
    // 2 attempts per key in case of temporary 503 overload
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        return response;
      } catch (err) {
        const status = err?.status || err?.code;
        // If 429 quota limit, break out of retry loop and jump to the next API key immediately
        if (status === 429) {
          console.warn('API Key rate limited. Falling back to next key...');
          break; 
        }
        // If 503 overloaded, retry once after 5s on the same key
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

export async function GET() {
  try {
    // Fetch all exams
    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select('id, name');

    if (examsError) throw examsError;
    if (!exams || exams.length === 0) return NextResponse.json({ message: "No exams found." });

    // Fetch all summaries to find the oldest or missing one
    const { data: summaries, error: summariesError } = await supabase
      .from('exam_summaries')
      .select('exam_id, last_updated_at')
      .order('last_updated_at', { ascending: true });

    if (summariesError) throw summariesError;

    // Pick exam: prefer one without summary, else oldest summary
    const summaryExamIds = new Set((summaries || []).map(s => s.exam_id));
    let examToProcess = exams.find(e => !summaryExamIds.has(e.id));

    if (!examToProcess && summaries && summaries.length > 0) {
      examToProcess = exams.find(e => e.id === summaries[0].exam_id);
    }

    if (!examToProcess) return NextResponse.json({ message: "Could not determine exam to process." });

    // Fetch ONLY the last 10 history logs to keep token usage low
    const { data: historyLogs, error: historyError } = await supabase
      .from('check_history')
      .select('status, expected_date, details, checked_at')
      .eq('exam_id', examToProcess.id)
      .order('checked_at', { ascending: false })
      .limit(10);

    if (historyError) throw historyError;

    if (!historyLogs || historyLogs.length === 0) {
      return NextResponse.json({ message: `No history logs found for ${examToProcess.name} yet.` });
    }

    const apiKeys = [
      process.env.GEMINI_API_KEYForConsisingData,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
      process.env.GEMINI_API_KEY_6,
      process.env.GEMINI_API_KEY_7
    ].filter(Boolean);

    if (apiKeys.length === 0) {
      throw new Error("No GEMINI API keys found in environment variables.");
    }

    // Build a compact text of the logs
    const historyText = historyLogs.map(log =>
      `[${log.checked_at}] ${log.status} | ${log.expected_date} | ${log.details}`
    ).join('\n');

    const prompt = `
You are a professional assistant summarizing Indian government recruitment exam updates.
Exam: "${examToProcess.name}"

Here are the most recent check logs (max 10):
${historyText}

Analyze them and return ONLY valid JSON in this exact format:
{
  "examName": "Full exam name",
  "conductingBody": "The organization that conducts this exam",
  "postName": "The post/role being recruited",
  "eligibility": "Brief eligibility (degree, age limit)",
  "notificationStatus": "Announced / Expected / Unknown",
  "expectedNotificationDate": "Month Year or exact date if known",
  "expectedExamDate": "Month Year or exact date if known",
  "applicationDeadline": "Date if known, else N/A",
  "officialWebsite": "URL if known, else N/A",
  "summary": "One concise paragraph merging all logs into a single update"
}

Return ONLY the JSON, nothing else.
    `;
    const response = await callGeminiWithFallback(prompt, apiKeys);


    const conciseText = response.text.trim();

    // Validate it's parseable JSON
    JSON.parse(conciseText);

    // Upsert into exam_summaries
    const { error: upsertError } = await supabase
      .from('exam_summaries')
      .upsert({
        exam_id: examToProcess.id,
        concise_text: conciseText,
        last_updated_at: new Date().toISOString()
      }, { onConflict: 'exam_id' });

    if (upsertError) throw upsertError;

    return NextResponse.json({
      success: true,
      summarized_exam: examToProcess.name
    });

  } catch (error) {
    console.error('Summary Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
