import { NextResponse } from "next/server";
import { getGenAI, aiRequestOptions } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { context, isPremium } = body;

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: { maxOutputTokens: 1500, temperature: 0.7 }
    }, aiRequestOptions());

    const premiumInstruction = isPremium 
      ? "Generate a FULL, highly detailed 7-day skincare diet plan including specific timings." 
      : "Generate a PARTIAL, basic 3-day skincare diet plan sample. At the end, add a note saying: '🌟 Upgrade to Premium to unlock the full 7-day personalized diet plan!'";

    const prompt = `
You are the Cream Expert Dietitian.
USER CONTEXT: ${context}

YOUR MISSION:
Generate a comprehensive, scientifically-backed diet and lifestyle plan to improve the user's skin health.

PLAN STRUCTURE (MANDATORY):
1. **DAILY MEAL PLAN**:
   - For each day, provide Breakfast, Lunch, and Dinner.
   - Use standard Markdown bullets (- ) for items.

2. **FOODS TO AVOID**:
   - List specific foods that will worsen the user's current skin condition.

3. **GLOW ROUTINE**:
   - WATER INTAKE: Specific quantity based on their needs.
   - TOPICAL APPLICATION: What oils or natural items they should apply to their face.
   - LIFESTYLE: Sleep and stress tips.

FORMATTING RULES:
- ALWAYS REPLY IN ENGLISH ONLY.
- Use standard Markdown: **Header** for sections, - for bullet points.
- Keep the tone professional and encouraging.
- ${premiumInstruction}
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
