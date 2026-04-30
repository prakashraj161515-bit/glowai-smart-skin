import { NextRequest, NextResponse } from 'next/server';
import { getSecureKey } from '@/lib/api-key-manager';

export async function POST(req: NextRequest) {
  try {
    const { metrics, skinType } = await req.json();
    const apiKey = getSecureKey();
    
    const prompt = `
      User Skin Analysis Report:
      - Overall Score: ${metrics.score}/100
      - Acne Severity: ${metrics.redness > 50 ? 'High' : metrics.redness > 20 ? 'Medium' : 'Low'}
      - Oiliness: ${metrics.oiliness > 60 ? 'High' : 'Normal'}
      - Pores/Texture: ${metrics.pores > 40 ? 'Visible' : 'Smooth'}
      - User Declared Skin Type: ${skinType}

      Generate a highly professional and personalized skincare plan for this user in JSON format:
      {
        "diet": ["Indian food option 1", "Indian food option 2", "..."],
        "morning_routine": ["Step 1", "Step 2", "..."],
        "night_routine": ["Step 1", "Step 2", "..."],
        "daily_tips": ["Tip 1", "Tip 2"],
        "summary": "Brief encouraging summary"
      }
      Focus on Indian dietary options and accessible products. Keep it concise.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
