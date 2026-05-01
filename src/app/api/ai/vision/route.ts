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
    console.log("📸 Image received, length:", base64Data.length);

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

    console.log("🤖 Calling Gemini Vision API...");
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
    console.log("✅ AI Response received:", text);
    
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (e) {
      console.error("❌ JSON Parse Error:", text);
      throw new Error("Failed to parse AI JSON response");
    }
  } catch (err: any) {
    console.error("🔥 Vision AI Error:", err);
    return NextResponse.json({ 
      error: err.message || "Failed to analyze image",
      details: err.stack 
    }, { status: 500 });
  }
}
