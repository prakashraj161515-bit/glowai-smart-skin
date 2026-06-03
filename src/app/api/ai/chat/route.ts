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
      model: "gemini-3.1-flash-lite",
      systemInstruction: `You are Aura, a warm, friendly AI skin coach inside the Cream app.

ANSWER STYLE (STRICT):
- Answer ONLY what the user asked. Do NOT add extra sections or topics they didn't ask for.
- Be SHORT: 2-5 sentences (max ~90 words) unless they explicitly ask for a full plan.
- Plain, friendly, simple language. English only. No medical jargon.
- Wrap the 2-4 MOST important words/phrases (key advice, a product name, an ingredient, a do/don't) in **double asterisks** so the app can highlight them. Don't over-do it.
- Only use bullets (- ) if you are genuinely listing 2-4 items; otherwise plain sentences.
- Never use markdown headers unless the user asked for a multi-section plan.
- If the user asks about their own face/skin, answer using their scan data below.
- If they ask about a skin condition/disease, briefly explain it, the likely cause, and ONE clear fix.

${body.context ? `\nUSER'S LATEST FACE SCAN: ${body.context}` : ""}`,
      generationConfig: { maxOutputTokens: 320, temperature: 0.6 }
    });

    const chat = model.startChat({
      history: body.history || [],
    });

    const result = await chat.sendMessage(body.message);
    
    return NextResponse.json({ text: result.response.text() });
  } catch (err: any) {
    console.error("🔥 Chat API Error:", err);
    return NextResponse.json({ error: err.message || "Connection failed" }, { status: 500 });
  }
}
