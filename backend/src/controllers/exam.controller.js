import { fetchExamUpdatesFromAI } from '../services/exam.service.js';



/**
 * Controller to fetch immediate exam updates using Gemini AI.
 */
export async function getExams(req, res, next) {
  try {
    const updates = await fetchExamUpdatesFromAI();
    return res.json(updates);
  } catch (error) {
    return next(error);
  }
}
