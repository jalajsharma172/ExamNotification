export async function prompt(examName, category) {
 const prompt = `
You are an expert in Indian Government, Banking, PSU, Regulatory Body, Insurance, and Public Sector recruitment notifications.

Your task is to determine the latest VERIFIED recruitment status for the following exam.

Exam Name: ${examName}
Category: ${category}

Instructions:
- Search for the latest available information from official sources first.
- Prefer official websites, official recruitment portals, official PDF notifications, or official press releases.
- If no official information exists, use only highly reliable sources and clearly indicate that the information is expected.
- Never guess, infer, or fabricate any information.
- Return ONLY a valid JSON object.
- Do NOT include markdown, code blocks, explanations, comments, or extra text.

JSON Schema:

{
  "status": "Upcoming | Expected | Ongoing | Closed | Postponed | Cancelled | Unknown",
  "officialDate": "YYYY-MM-DD or YYYY-MM-DD to YYYY-MM-DD, or null",
  "expectedDate": "YYYY-MM-DD or YYYY-MM-DD to YYYY-MM-DD, or null",
  "statusDate": "YYYY-MM-DD or null",
  "statusTime": "HH:MM (24-hour) or null",
  "rounds": [
    "Round Name"
  ],
  "searchingLink": "Official recruitment page or notification URL. If unavailable, use the most reliable source. Otherwise null.",
  "copyTextToSearchByOwn": "A concise Google search query to find the latest recruitment update.",
  "details": "Maximum 2 factual sentences summarizing the latest verified recruitment status.",
  "lastVerifiedDate": "Current date (YYYY-MM-DD)",
  "lastVerifiedTime": "Current time (HH:MM, 24-hour)"
}

Rules:
1. Output MUST be valid JSON that can be parsed directly using JSON.parse().
2. Use null instead of "Unknown", "N/A", empty strings, "-", or placeholder text for unavailable fields.
3. Never invent dates, URLs, rounds, or timings.
4. If an official notification exists:
   - officialDate must contain the official date.
   - expectedDate must be null.
5. If only expected information exists:
   - officialDate must be null.
   - expectedDate must contain the expected date.
   - status should normally be "Expected".
6. status must be exactly one of:
   - Upcoming
   - Expected
   - Ongoing
   - Closed
   - Postponed
   - Cancelled
   - Unknown
7. rounds must always be an array.
   Example:
   ["Preliminary Exam", "Main Exam", "Interview"]
   If unavailable, return [].
8. searchingLink should preferably be an official recruitment notification or official recruitment page.
9. details must contain only verified facts and must never exceed two sentences.
10. Dates must always use YYYY-MM-DD format.
11. Time must always use HH:MM (24-hour) format.
12. lastVerifiedDate and lastVerifiedTime should represent the current date and time when generating the response.
13. copyTextToSearchByOwn should be a concise Google search query, for example:
"${examName} ${new Date().getFullYear()} Recruitment Notification"
`;
return prompt;
}