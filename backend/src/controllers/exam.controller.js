import { getExamsFromDB } from '../supabase/getExamsInfoFromDB.js';



/**
 * Controller to fetch immediate exam updates using Gemini AI.
 */
export async function getExams(req, res, next) {
  try {
    const updates = await getExamsFromDB();
    return res.json(updates);
  } catch (error) {
    console.error(error);
  return next(error);
  }
}

// console.log(await getExams());