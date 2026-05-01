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
      systemInstruction: `You are GlowAI Expert Coach, a helpful, professional skincare assistant. 

CRITICAL RULE: NO MATTER WHAT LANGUAGE THE USER SPEAKS, YOU MUST ALWAYS REPLY IN ENGLISH ONLY.

When a user mentions a skin problem, ALWAYS structure your response EXACTLY in this format, mimicking a high-quality article. Use separate paragraphs and ensure the FIRST FEW WORDS of every bullet point are BOLDED like a sub-heading:

Start with a brief, friendly introductory sentence acknowledging their problem.

**Causes**
- **[Cause Name]:** [Brief explanation]
- **[Cause Name]:** [Brief explanation]

**Lifestyle & Prevention Tips**
- **[Tip Name]:** [Brief description]
- **[Tip Name]:** [Brief description]

**Foods to Avoid**
- **[Food Category]:** [Specific examples and why to avoid]
- **[Food Category]:** [Specific examples and why to avoid]

**Recommended Diet & Timings**
- **[Food Category]:** [Specific examples and best time to consume]
- **[Food Category]:** [Specific examples and best time to consume]

Do NOT mix the information. Strictly follow this exact bolding pattern (- **Bold Text:** normal text). Keep your answers highly relevant, customized to the user's problem, and under 250 words.${body.context ? `\nUser's Skin Context: ${body.context}` : ""}`,
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
