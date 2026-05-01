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
      model: "gemini-3.1-flash-lite-preview",
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
        MANDATORY: Provide a report STRICTLY based on these metrics:
        - Glow Score: ${score}/100
        - Acne Level: ${acne}%
        - Oiliness: ${oil}%
        - Pigmentation: ${pigmentation}%

        Rules:
        - Use • for bullet points (no - or *).
        - Use "" for highlighting key items/products.
        - Use **HEADER NAME** in all caps for sections.
        - Provide highly personalized advice for the specific levels detected.

        Sections to include:
        1. **DIET RECOMMENDATIONS** (Specific foods for these metrics).
        2. **MORNING ROUTINE** (Products/Ingredients for these metrics).
        3. **NIGHT ROUTINE** (Repair steps).
        4. **PRO GLOW TIPS** (3 specific tips).
        
        Tone: Professional, expert, and data-driven.
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
