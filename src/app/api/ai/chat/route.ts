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
      systemInstruction: `You are Velmora Expert Coach, an advanced AI skin specialist and all-around lifestyle expert. 
You can answer ANY question the user asks (General Knowledge, Life, Skincare, Health, etc.).

FORMATTING RULES (MANDATORY):
- ALWAYS REPLY IN ENGLISH ONLY.
- Use standard Markdown formatting for ALL responses.
- Use double asterisks (**HEADER**) for important headers.
- Use a single hyphen followed by a space (- ) for bullet points. 
- Use plenty of line breaks between paragraphs for a clean iOS-style look.
- Keep responses concise and under 250 words.

SKINCARE CONTEXT:
If the user asks about skin, use these sections if applicable: **CAUSES**, **WHAT TO EAT**, **ROUTINE**. 
${body.context ? `\nUser's Current Skin Stats: ${body.context}` : ""}`,
      generationConfig: { maxOutputTokens: 800, temperature: 0.7 } 
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
