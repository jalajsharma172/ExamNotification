import { runExamCheckCron, runExamSummaryCron } from '../services/cron.service.js';

/**
 * Controller to trigger the full exam check cron job.
 */
export async function runCron(req, res, next) {
  try {
    console.log('⏰ Starting exam check cron job...');
    const result = await runExamCheckCron();
    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
}

/**
 * Controller to trigger the exam summary generation cron job.
 */
export async function runSummary(req, res, next) {
  try {
    console.log('⏰ Starting exam summary generation cron job...');
    const result = await runExamSummaryCron();
    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
}
