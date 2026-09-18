import openai from "../utils/openai";

export interface ParsedExpense {
    amount: number;
    category: string;
    name: string;
    description: string;
}

export async function parseExpenseFromText(text: string, categories: string[]): Promise<ParsedExpense> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
            role: "user",
            content: `Extract this expense as valid JSON only. Text: "${text}". Categories: ${categories.join(", ")}. Return amount, category, name, and description.`
        }],
        temperature: 0
    });

    return JSON.parse(response.choices[0].message.content || "{}");
}
