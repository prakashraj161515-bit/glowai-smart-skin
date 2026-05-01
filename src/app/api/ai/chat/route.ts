import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "API key missing" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are GlowAI Expert Coach. The user is asking: "${body.message}"
      Provide a helpful, professional skincare response. Keep it under 200 words.
    `;

    const result = await model.generateContent(prompt, { 
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 } 
    });
    
    return NextResponse.json({ text: result.response.text() });
  } catch (err: any) {
    console.error("🔥 Chat API Error:", err);
    return NextResponse.json({ error: "Connection failed" }, { status: 500 });
  }
}
