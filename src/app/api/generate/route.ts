import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSecureKey } from '@/lib/api-key-manager';

export async function POST(req: NextRequest) {
  try {
    const { acne, oil, pigmentation } = await req.json();
    const apiKey = getSecureKey();
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      User skin analysis:
      Acne: ${acne}/100
      Oil: ${oil}/100
      Pigmentation: ${pigmentation}/100

      Give:
      1. Diet (Indian foods only)
      2. Morning routine
      3. Night routine
      4. 5 tips
      
      Keep it very concise. Format as JSON with keys: diet, morning, night, tips.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean JSON if needed
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
