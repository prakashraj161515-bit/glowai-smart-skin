import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const userMessage = body.message || "Give skincare tips";

    const prompt = `
You are a skincare expert.

User says: ${userMessage}

Give helpful skincare advice in simple language.
`;

    const result = await model.generateContent(prompt);

    return NextResponse.json({
      text: result.response.text()
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
