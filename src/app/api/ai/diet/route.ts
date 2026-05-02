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
You are the Velmora Dietitian. Generate a personalized 7-day skincare-focused diet plan for a user.
User's Skin Context: ${context || "Healthy skin, no specific issues mentioned."}

CRITICAL RULES:
1. ALWAYS REPLY IN ENGLISH ONLY.
2. Structure the plan as a clean table or clear list for each day (Day 1 to Day 7).
3. For each day, include: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, and Dinner.
4. Focus on ingredients that improve skin health (Anti-inflammatory, rich in Zinc, Vitamins A/C/E).
5. Add a "Daily Routine" section at the end for water intake and sleep.
6. Use double asterisks (**HEADER**) for headings.
7. Use dot signs (•) for bullet points.

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
