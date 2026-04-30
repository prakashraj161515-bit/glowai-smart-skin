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
      - Diet (Indian foods)
      - Morning routine
      - Night routine
      - 5 skin tips
      
      Keep it concise and professional. Format as JSON.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
