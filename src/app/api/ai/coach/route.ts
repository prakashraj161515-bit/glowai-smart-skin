import { NextRequest, NextResponse } from 'next/server';
import { getSecureKey } from '@/lib/api-key-manager';

export async function POST(req: NextRequest) {
  try {
    const { metrics, skinType } = await req.json();
    const apiKey = getSecureKey();
    
    const prompt = `
      You are the GlowAI Smart Skin Coach. Analyze these metrics and provide a comprehensive skin report:
      - Overall Score: ${metrics.score}/100
      - Redness (Acne): ${metrics.redness}%
      - Oiliness: ${metrics.oiliness}%
      - Pores: ${metrics.pores}%
      - Skin Type: ${skinType}

      As a "Fully AI" coach, generate a detailed 7-day personalized plan in JSON:
      {
        "skin_analysis": "Detailed AI observation",
        "diet": ["Day 1: ...", "Day 2: ...", "..."],
        "morning_routine": ["Step 1: ...", "..."],
        "night_routine": ["Step 1: ...", "..."],
        "lifestyle_tips": ["Tip 1", "Tip 2"],
        "improvement_forecast": "What to expect in 2 weeks"
      }
      Provide Indian food names and culturally relevant tips.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    let content = data.candidates[0].content.parts[0].text;
    
    // Clean JSON response if it contains markdown markers
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("AI Proxy Error:", error);
    return NextResponse.json({ error: "Failed to generate AI recommendations" }, { status: 500 });
  }
}
