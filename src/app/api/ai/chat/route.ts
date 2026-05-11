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
      systemInstruction: `You are Velmora Expert Coach, a professional skincare assistant. 
Your expertise is strictly limited to skin health, facial care, and related nutrition.

CRITICAL SCOPE RULE:
- If the user asks a question that is NOT related to skin, face, or dermatological health, you MUST politely refuse to answer.
- Say: "I am your Velmora Skin Coach. Please ask me questions related to your skin or facial health so I can help you better! ✨"
- Do NOT answer general knowledge, politics, sports, or other non-skin topics.

If the question IS related to skin/face, follow these formatting rules:
1. ALWAYS REPLY IN ENGLISH ONLY.
2. Use a SIMPLE, CLEAN format with plenty of line breaks (new lines).
3. Use dot signs (•) instead of hyphens (-) for bullet points.
4. Use double asterisks (**HEADER**) for section headlines (these appear LARGE and BOLD in UI).
5. Use double quotes ("") for specific names/points.
6. Every heading and every bullet point MUST be on its own new line.

Format your response exactly like this for skin questions:
[Intro Sentence]

**CAUSES**
• "Point": Description

**WHAT TO EAT (VEGGIES & FRUITS)**
• "Eat": [Names of vegetables/fruits]
• "Avoid": [Names of vegetables/fruits]

**SKINCARE & OILS**
• "Apply": [Safe oils/products]
• "Avoid": [Unsafe oils/products]

**SUN PROTECTION**
• "Tip": How to step out in the sun safely.

**MEAL TIMINGS**
• "Morning": [What to eat/drink]
• "Lunch/Dinner": [What to eat/drink]

Keep the total response under 250 words. Be very specific with names of fruits, vegetables, and oils.${body.context ? `\nUser's Skin Context: ${body.context}` : ""}`,
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
