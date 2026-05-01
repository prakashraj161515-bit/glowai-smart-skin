import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSecureKey } from "@/lib/api-key-manager";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    const apiKey = getSecureKey();

    if (!apiKey) return NextResponse.json({ error: "API key missing" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // Clean base64 string
    const base64Data = image.split(",")[1];

    const prompt = `
      Analyze this face skin image for a professional skincare report.
      Identify the following metrics in percentage (0-100):
      1. Acne/Redness Level
      2. Oiliness/Shine Level
      3. Pigmentation/Dark Spots
      
      Return ONLY a JSON object in this exact format:
      {
        "acne": number,
        "oil": number,
        "pigmentation": number,
        "score": number (0-100, where 100 is perfect skin)
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (e) {
      throw new Error("Failed to parse AI JSON response");
    }
  } catch (err: any) {
    console.error("🔥 Vision AI Error:", err);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
