
import {AutoRun} from '../services/autoruncrons';


/**
 * Controller to fetch immediate exam updates using Gemini AI.
 */
export async function getExams(req, res, next) {
  try {
    const cnt = await AutoRun();
    const setcnt=await 
    return res.json(updates);
  } catch (error) {
    console.error(error);
  return next(error);
  }
}

// console.log(await getExams());