import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getSecureKey } from "@/lib/api-key-manager";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { context } = body;

    const apiKey = getSecureKey();
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
    });

    const prompt = `
You are the Velmora Dietitian, a professional skincare nutritionist. 
Your expertise is strictly limited to skin health, facial care, and dermatological nutrition.

CRITICAL SCOPE RULE:
- If the user's context or input is NOT related to skin, face, or dermatological health, you MUST politely refuse to generate a plan.
- Say: "I am your Velmora Skin Dietitian. Please ask me for a diet plan related to your skin or facial health so I can help you better! ✨"
- Do NOT provide advice for non-skin medical issues, general weight loss, or other topics.

If the input IS related to skin/face, follow these rules:
1. ALWAYS REPLY IN ENGLISH ONLY.
2. Structure the plan as a clean table or clear list for each day (Day 1 to Day 7).
3. For each day, include: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, and Dinner.
4. IMPORTANT: Tailor all food recommendations to the USER'S LOCATION mentioned in the context. Use ingredients and dishes that are easily available and culturally common in that region.
5. Focus on ingredients that improve skin health (Anti-inflammatory, rich in Zinc, Vitamins A/C/E).
6. Add a "Daily Routine" section at the end for water intake and sleep.
7. Use double asterisks (**HEADER**) for headings.
8. Use dot signs (•) for bullet points.

Keep it structured and easy to read.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Diet Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
