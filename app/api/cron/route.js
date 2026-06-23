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
    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
      process.env.GEMINI_API_KEY_6,
      process.env.GEMINI_API_KEY_7
    ].filter(Boolean);
    // 1. Fetch the exam to check. Priority: is_retrying = true, else oldest last_checked_at
    let { data: exams, error: fetchError } = await supabase
      .from('exams')
      .select('*')
      .eq('is_retrying', true)
      .limit(1);
      
    if (fetchError) throw fetchError;
    
    if (!exams || exams.length === 0) {
      const { data: oldestExams, error: oldestError } = await supabase
        .from('exams')
        .select('*')
        .order('last_checked_at', { ascending: true, nullsFirst: true })
        .limit(1);
        
      if (oldestError) throw oldestError;
      exams = oldestExams;
    }
    
    if (!exams || exams.length === 0) {
        return NextResponse.json({ message: "No exams found in database." });
    }
    
    const exam = exams[0];
    
    // 2. Call Gemini with fallback
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

    const response = await callGeminiWithFallback(prompt, apiKeys);
    const text = response.text;
    const aiResult = JSON.parse(text);
    
    // 3. Update exam table
    const { error: updateError } = await supabase
      .from('exams')
      .update({
        status: aiResult.status,
        expected_date: aiResult.expectedDate,
        details: aiResult.details,
        last_checked_at: new Date().toISOString()
      })
      .eq('id', exam.id);
      
    if (updateError) throw updateError;
    
    // 4. Insert into check_history
    const { error: insertError } = await supabase
      .from('check_history')
      .insert({
        exam_id: exam.id,
        status: aiResult.status,
        expected_date: aiResult.expectedDate,
        details: aiResult.details,
        is_correct: true
      });
      
    if (insertError) throw insertError;
    
    return NextResponse.json({ 
        success: true, 
        checked_exam: exam.name, 
        result: aiResult 
    });
    
  } catch (error) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
