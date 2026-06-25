import { seedExams, fetchExamUpdatesFromAI } from '../services/exam.service.js';

/**
 * Controller to trigger database seeding.
 */
export async function seedDatabase(req, res, next) {
  try {
    const insertedCount = await seedExams();
    return res.json({ success: true, inserted: insertedCount });
  } catch (error) {
    return next(error);
  }
}

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
