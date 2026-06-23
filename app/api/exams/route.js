import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const maxDuration = 60; // Allow up to 60 seconds on Vercel hobby plan

export async function GET() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Read exams
    const filePath = path.join(process.cwd(), 'data', 'exams.json');
    const examsData = fs.readFileSync(filePath, 'utf8');
    const exams = JSON.parse(examsData);
    
    // Construct prompt
    const prompt = `
      You are an expert at tracking government and bank IT recruitment exams in India.
      I have a list of exams. I need to know the latest update or expected notification date for each.
      Please return a JSON response with the following format exactly:
      {
        "updates": [
          {
            "name": "Exam Name",
            "status": "Upcoming" | "Announced" | "Ongoing" | "Unknown",
            "expectedDate": "Month Year (e.g. Feb 2027) or specific date",
            "details": "A brief 1-2 sentence update on the current status."
          }
        ]
      }
      
      Here are the exams:
      ${JSON.stringify(exams.map(e => e.name))}
      
      Return ONLY valid JSON.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    const text = response.text;
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error('Error fetching updates:', error);
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
  }
}
