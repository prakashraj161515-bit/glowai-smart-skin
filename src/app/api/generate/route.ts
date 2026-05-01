import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSecureKey } from "@/lib/api-key-manager";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = getSecureKey();

    if (!apiKey) return NextResponse.json({ error: "API key missing" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
    });

    let prompt = "";

    if (body.message) {
      // Chat mode - Expert Persona
      prompt = `
        You are GlowAI, a world-class dermatological assistant. 
        User Question: "${body.message}"
        
        Provide professional, empathetic, and scientifically-backed skincare advice. 
        Keep it concise but helpful. If you suggest products, mention ingredients like Salicylic Acid, Niacinamide, or Vitamin C.
      `;
    } else {
      // Scan mode - Detailed Analysis
      const { acne = 0, oil = 0, pigmentation = 0, score = 0 } = body;
      prompt = `
        You are GlowAI, a world-class dermatological assistant. 
        Analyze these skin metrics:
        - Glow Score: ${score}/100
        - Acne Level: ${acne}%
        - Oiliness: ${oil}%
        - Pigmentation: ${pigmentation}%

        Based on these, provide:
        1. 🥗 A specific Indian Diet Plan (focusing on antioxidants and hydration).
        2. ☀️ Morning Skincare Routine.
        3. 🌙 Night Skincare Routine.
        4. ✨ 3 Pro-tips for long-term skin health.
        
        Use a professional yet encouraging tone. Mention specific Indian foods like Amla, Turmeric, or Curd where relevant.
      `;
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("🔥 Next.js AI Error:", err);
    return NextResponse.json({ error: "Failed to connect to AI" }, { status: 500 });
  }
}
