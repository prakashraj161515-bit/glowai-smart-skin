import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSecureKey } from "@/lib/api-key-manager";

export async function POST(req: Request) {
  try {
    const { metrics, skinType } = await req.json();

    const apiKey = getSecureKey();
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const prompt = `
You are the Velmora Smart Skin Coach. Analyze these metrics and provide a comprehensive skin report:
- Overall Score: ${metrics?.score ?? 70}/100
- Redness (Acne): ${metrics?.redness ?? 0}%
- Oiliness: ${metrics?.oiliness ?? 0}%
- Pores: ${metrics?.pores ?? 0}%
- Skin Type: ${skinType ?? "Normal"}

As a "Fully AI" coach, generate a detailed personalized plan in JSON:
{
  "skin_analysis": "Detailed AI observation",
  "diet": ["Tip 1", "Tip 2", "Tip 3"],
  "morning_routine": ["Step 1", "Step 2"],
  "night_routine": ["Step 1", "Step 2"],
  "lifestyle_tips": ["Tip 1", "Tip 2"],
  "improvement_forecast": "What to expect in 2 weeks"
}
Provide Indian food names and culturally relevant tips. Return ONLY valid JSON, no markdown.
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Clean any markdown code blocks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    console.error("AI Coach Error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
