// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import supabase from '../config/supabase.js';
// import env from '../config/config.js';
// import { GoogleGenAI } from '@google/genai';


/**
 * Fetches a draft prompt update for all exams from the database using a single API Key.
 */
// export async function fetchExamUpdatesFromAI() {
//   const apiKey = env.geminiApiKey;
//   if (!apiKey) {
//     throw new Error('GEMINI_API_KEY environment variable is missing.');
//   }
//   const ai = new GoogleGenAI({ apiKey });

//   const exams = await getExamsFromDB();
//   if (exams.length === 0) {
//     return { updates: [] };
//   }

//   const prompt = `
//     You are an expert at tracking government and bank IT recruitment exams in India.
//     I have a list of exams. I need to know the latest update or expected notification date for each.
//     Please return a JSON response with the following format exactly:
//     {
//       "updates": [
//         {
//           "name": "Exam Name",
//           "status": "Upcoming" | "Announced" | "Ongoing" | "Unknown",
//           "expectedDate": "Month Year (e.g. Feb 2027) or specific date",
//           "details": "A brief 1-2 sentence update on the current status."
//         }
//       ]
//     }
    
//     Here are the exams:
//     ${JSON.stringify(exams.map(e => e.name))}
    
//     Return ONLY valid JSON.
//   `;

//   const response = await ai.models.generateContent({
//     model: 'gemini-3.5-flash',
//     contents: prompt,
//     config: {
//       responseMimeType: "application/json"
//     }
//   });

//   return JSON.parse(response.text);
// }
