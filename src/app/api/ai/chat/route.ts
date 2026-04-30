import { NextRequest, NextResponse } from 'next/server';
import { getSecureKey } from '@/lib/api-key-manager';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    const apiKey = getSecureKey();
    
    // Using Gemini with tools (Google Search grounding)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...history,
          { role: 'user', parts: [{ text: message }] }
        ],
        tools: [
          {
            google_search_retrieval: {} // Enables live internet search
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const aiText = data.candidates[0].content.parts[0].text;
    
    return NextResponse.json({ text: aiText });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: "Failed to connect to AI Coach" }, { status: 500 });
  }
}
