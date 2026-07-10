import { GoogleGenAI } from "@google/genai";
const prompt = `
You are an expert on Indian government and banking recruitment notifications.

Your task is to determine the latest official recruitment status for the following exam.

Exam Name: SBI IT Recruitment 2026
Category: Banking

Instructions:
- Use only reliable and recent information.
- Do NOT guess or speculate.
- If no official notification exists, return "Unknown".
- If only expected dates are available from reliable sources, clearly mention that they are expected, not official.
- The "details" field must be concise (maximum 2 sentences).

Return ONLY valid JSON.
Do NOT wrap the JSON in markdown.
Do NOT include any explanation before or after the JSON.

JSON Schema:
{
  "status": "Upcoming" | "Announced" | "Ongoing" | "Unknown",
  "expectedDate": "YYYY-MM-DD | Month YYYY | Unknown",
  "details": "string"
}
`;

const ai = new GoogleGenAI({ apiKey: "AIzaSyAVd88YVpl6l6NGk1ZtwPkgUmNnhJXCv5g" });
try {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [
        {
          googleSearch: {}
        }
      ]
    }
  });

  console.log(response.text);
} catch (err) {
  console.error('Error calling GenAI:', err);
}

