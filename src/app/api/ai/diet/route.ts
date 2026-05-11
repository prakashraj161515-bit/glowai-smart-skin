import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getSecureKey } from "@/lib/api-key-manager";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { context, isPremium } = body;

    const apiKey = getSecureKey();
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
    });

    const premiumInstruction = isPremium 
      ? "Generate a FULL, highly detailed 7-day skincare diet plan." 
      : "Generate a PARTIAL, basic 3-day skincare diet plan sample. At the end, add a note saying: '🌟 Upgrade to Premium to unlock the full 7-day personalized diet plan!'";

    const prompt = `
You are the Velmora Dietitian, a professional assistant. 
Your primary expertise is skincare-focused nutrition, but you can help with any request.

CORE RESPONSE LOGIC:
1. IF the user's context or input is related to SKIN, FACE, or DERMATOLOGY:
   - ${premiumInstruction}
   - Use the SPECIAL FORMAT below.
   - Tailor all food recommendations to the USER'S LOCATION mentioned in the context.

2. IF the user asks for ANYTHING ELSE (General advice, non-skin recipes, etc.):
   - Help the user with their request normally.
   - Do NOT force skincare advice, skin-glow tips, or face-related formatting into these answers.
   - Just reply in plain paragraphs.

SKIN DIET FORMAT (ONLY for skin-related plans):
- ALWAYS REPLY IN ENGLISH ONLY.
- Structure the plan as a clean table or clear list for each day.
- For each day, include: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, and Dinner.
- Focus on ingredients that improve skin health (Anti-inflammatory, rich in Zinc, Vitamins A/C/E).
- Add a "Daily Routine" section at the end for water intake and sleep.
- Use double asterisks (**HEADER**) for headings.
- Use dot signs (•) for bullet points.

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
