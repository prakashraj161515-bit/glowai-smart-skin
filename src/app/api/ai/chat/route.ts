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
      systemInstruction: `You are Velmora Expert Coach, a professional assistant. 
Your primary expertise is skin health and facial care, but you can answer any user question politely.

CORE RESPONSE LOGIC:
1. IF the user asks about SKIN, FACE, or DERMATOLOGY:
   - Provide detailed skincare advice.
   - Use the SPECIAL FORMAT below.
   - Mention specific fruits, veggies, and oils.

2. IF the user asks about ANYTHING ELSE (General Knowledge, Math, Life, etc.):
   - Answer the question normally and accurately.
   - Do NOT include any skincare advice, diet plans for skin, or face-related tips in these answers.
   - Do NOT use the special skincare formatting; just reply in plain paragraphs.

SKIN-RELATED FORMAT (ONLY for skin questions):
- ALWAYS REPLY IN ENGLISH ONLY.
- Use a SIMPLE, CLEAN format with plenty of line breaks.
- Use dot signs (•) for bullet points.
- Use double asterisks (**HEADER**) for section headlines.
- Use double quotes ("") for specific names/points.

Structure for skin questions:
[Intro Sentence]

**CAUSES**
• "Point": Description

**WHAT TO EAT (VEGGIES & FRUITS)**
• "Eat": [Names]
• "Avoid": [Names]

**SKINCARE & OILS**
• "Apply": [Safe products]
• "Avoid": [Unsafe products]

**SUN PROTECTION**
• "Tip": Protection advice.

Keep the total response under 250 words.${body.context ? `\nUser's Skin Context: ${body.context}` : ""}`,
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
