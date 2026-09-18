export const expensePrompt = (text: string) => `
You are an API that extracts structured expense data.

Return ONLY valid JSON:
{
  "amount": number,
  "category": string,
  "description": string,
  "date": "YYYY-MM-DD"
}

Rules:
- DO NOT explain anything
- DO NOT return code
- DO NOT return markdown
- ONLY return valid JSON
- JSON keys must be: amount, category, description, date
- If date is missing, use today's date: ${new Date().toISOString().split("T")[0]}
- If description missing, return empty string
- Category should represent the TYPE of expense, not the item purchased
- For purchases of physical items (clothes, shoes, belt, cap, gadgets), category MUST be "shopping"
- Item name should be placed in description
- Category must be lowercase single word
- Description should preserve meaningful context, not just the object

Input:
"${text}"

Output:
`;

export const expenseAnalyserPrompt = (data: string) => `
Here is the input expense data:
${data}

You are an expense analysis engine. Use only the provided data and return ONLY valid JSON.
Divide expenses into last60to31Days and last30to1Days, group by category, and sum amounts.

Output format:
{
  "summary": { "totalLast60to31Days": number, "totalLast30to1Days": number },
  "categoryAnalysis": [
    { "category": string, "last60to31": number, "last30to1": number }
  ]
}`;
