import supabase from '../config/supabase.js';
import { getExamsFromDB } from './exam.service.js';
import { callGeminiCyclic, callGeminiWithFallback } from './gemini.service.js';
import { getAllApiKeys } from '../config/gemini.js';

/**
 * Runs the check cron for all exams, updates DB, and populates the history.
 */
export async function runExamCheckCron() {
  const apiKeys = getAllApiKeys();
  console.log(`🔑 Found ${apiKeys.length} Gemini API keys.`);

  const exams = await getExamsFromDB();
  if (!exams || exams.length === 0) {
    return { message: 'No exams found in database.' };
  }

  console.log(`📋 Found ${exams.length} exams to process.`);

  const results = [];
  const errors = [];

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
      const { response, successfull, unsucessfull } = await callGeminiCyclic(prompt);
      const aiResult = JSON.parse(response.text);

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

      await supabase.from('check_history').insert({
        exam_id: exam.id,
        status: aiResult.status,
        expected_date: aiResult.expectedDate,
        details: aiResult.details,
        is_correct: true,
        successfull,
        unsucessfull,
      });

      console.log(`✅ Saved: ${exam.name} → ${aiResult.status} [success calls: ${successfull}, failed calls: ${unsucessfull}]`);
      results.push({ exam: exam.name, result: aiResult, successfull, unsucessfull });

    } catch (err) {
      console.error(`❌ Failed for ${exam.name}:`, err.message);
      errors.push({ exam: exam.name, error: err.message });

      const successfull = err.successfull ?? 0;
      const unsucessfull = err.unsucessfull ?? apiKeys.length;

      await supabase.from('check_history').insert({
        exam_id: exam.id,
        status: 'Unknown',
        details: `Auto-check failed: ${err.message}`,
        is_correct: false,
        successfull,
        unsucessfull,
      });

      continue;
    }
  }

  return {
    processed: results.length,
    failed: errors.length,
    results,
    errors,
  };
}

/**
 * Runs the summary compiler cron which merges logs for a specific exam.
 */
export async function runExamSummaryCron() {
  const { data: exams, error: examsError } = await supabase
    .from('exams')
    .select('id, name');

  if (examsError) throw examsError;
  if (!exams || exams.length === 0) {
    return { message: "No exams found." };
  }

  const { data: summaries, error: summariesError } = await supabase
    .from('exam_summaries')
    .select('exam_id, last_updated_at')
    .order('last_updated_at', { ascending: true });

  if (summariesError) throw summariesError;

  const summaryExamIds = new Set((summaries || []).map(s => s.exam_id));
  let examToProcess = exams.find(e => !summaryExamIds.has(e.id));

  if (!examToProcess && summaries && summaries.length > 0) {
    examToProcess = exams.find(e => e.id === summaries[0].exam_id);
  }

  if (!examToProcess) {
    return { message: "Could not determine exam to process." };
  }

  const { data: historyLogs, error: historyError } = await supabase
    .from('check_history')
    .select('status, expected_date, details, checked_at')
    .eq('exam_id', examToProcess.id)
    .order('checked_at', { ascending: false })
    .limit(10);

  if (historyError) throw historyError;

  if (!historyLogs || historyLogs.length === 0) {
    return { message: `No history logs found for ${examToProcess.name} yet.` };
  }

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
  
  const response = await callGeminiWithFallback(prompt);
  const conciseText = response.text.trim();

  // Test parse to validate JSON structure
  JSON.parse(conciseText);

  const { error: upsertError } = await supabase
    .from('exam_summaries')
    .upsert({
      exam_id: examToProcess.id,
      concise_text: conciseText,
      last_updated_at: new Date().toISOString()
    }, { onConflict: 'exam_id' });

  if (upsertError) throw upsertError;

  return {
    success: true,
    summarized_exam: examToProcess.name
  };
}
