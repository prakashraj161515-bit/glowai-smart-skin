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
      systemInstruction: `You are GlowAI Expert Coach, a professional skincare assistant. 

CRITICAL RULES:
1. ALWAYS REPLY IN ENGLISH ONLY.
2. Use a SIMPLE, CLEAN format with plenty of line breaks (new lines).
3. Every heading and every bullet point MUST be on its own new line.
4. Do NOT use dense paragraphs.

Format your response exactly like this:
[Intro Sentence]

**Causes**
- **[Point]:** [Description]
- **[Point]:** [Description]

**Prevention**
- **[Point]:** [Description]

**Diet**
- **[Point]:** [Description]

**Timings**
- **[Point]:** [Description]

Keep the total response under 200 words.${body.context ? `\nUser's Skin Context: ${body.context}` : ""}`,
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 } 
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
