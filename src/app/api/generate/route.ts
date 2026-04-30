import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ API KEY CHECK
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key missing" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    // ✅ HANDLE BOTH CASES (chat + scan)
    let prompt = "";

    if (body.message) {
      // Chat mode
      prompt = `
You are a skincare expert.

User says: ${body.message}

Give simple, useful skincare advice.
`;
    } else {
      // Scan mode
      const acne = body.acne ?? 0;
      const oil = body.oil ?? 0;
      const pigmentation = body.pigmentation ?? 0;

      prompt = `
User Skin Analysis:
Acne: ${acne}%
Oil: ${oil}%
Pigmentation: ${pigmentation}%

Give:
- Diet (Indian)
- Morning routine
- Night routine
- Tips
`;
    }

    const result = await model.generateContent(prompt);

    const text = result?.response?.text();

    // ✅ SAFE CHECK
    if (!text) {
      return NextResponse.json(
        { error: "No AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ text });

  } catch (err: any) {
    console.error("🔥 ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
