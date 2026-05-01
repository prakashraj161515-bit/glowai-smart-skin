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
      model: "gemini-2.5-flash",
      systemInstruction: `You are GlowAI Expert Coach, a helpful, professional skincare assistant. 

CRITICAL RULE: NO MATTER WHAT LANGUAGE THE USER SPEAKS, YOU MUST ALWAYS REPLY IN ENGLISH ONLY.

When a user mentions a skin problem, ALWAYS structure your response EXACTLY in this simple format. Use separate paragraphs for each section and list the details line-by-line in bullet points:

Start with a brief, friendly introductory sentence acknowledging their problem.

**Causes**
- [list root causes line-by-line]

**Prevention**
- [list prevention steps line-by-line]

**Caution**
- [list things to strictly avoid line-by-line]

**Recommended Diet**
- [list diet tips line-by-line]

Do NOT mix the information. Keep everything organized strictly under these bolded headings using clean, vertical bullet points so it is easy to read. Keep your answers highly relevant, customized to the user's problem, and under 250 words.${body.context ? `\nUser's Skin Context: ${body.context}` : ""}`,
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
