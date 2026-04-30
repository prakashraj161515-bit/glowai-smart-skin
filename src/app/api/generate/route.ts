import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const body = await req.json();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
  });

  const prompt = `
User skin:
Acne: ${body.acne}
Oil: ${body.oil}
Pigmentation: ${body.pigmentation}

Give:
- Diet (Indian)
- Morning routine
- Night routine
- Tips
`;

  const result = await model.generateContent(prompt);

  return NextResponse.json({
    text: result.response.text()
  });
}
