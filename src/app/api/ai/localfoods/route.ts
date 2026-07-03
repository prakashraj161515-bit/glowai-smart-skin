// Returns a CITY/DISTRICT-specific food bank: simple, healthy dishes that are
// commonly eaten AND easily available in the user's exact area. Used by the
// routine diet plan so meals feel truly local.
import { NextResponse } from "next/server";
import { generateWithGateway } from "@/lib/ai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { area, focus } = await req.json();
    if (!area || !String(area).trim()) {
      return NextResponse.json({ error: "no area" }, { status: 400 });
    }

    const prompt = `You are Cream's local nutrition expert.
The user lives in: "${area}" (a specific city/district).
List foods that are COMMONLY EATEN and EASILY AVAILABLE in THAT exact city/district
(local everyday food, easy to find in local markets there) — and that are HEALTHY
and good for skin. Keep every dish SIMPLE and easy to make. Skin focus: ${focus || "general skin health"}.

Return ONLY valid JSON in this EXACT shape (no extra text):
{
  "breakfast": [{ "name": "<dish>", "emoji": "<1 food emoji>", "why": "<max 5 words benefit>" }, ... 6 items],
  "lunch":     [ ... 6 items ],
  "dinner":    [ ... 6 items ],
  "snack":     [ ... 6 items, include local FRUITS and skin-friendly DRY FRUITS / nuts (almonds, walnuts, etc.) ],
  "avoid":     [ "<3-5 foods to limit for this skin>" ]
}
Rules: real dishes actually eaten in ${area}; healthy + simple only (no junk/fried as a suggestion);
STRICTLY 100% VEGETARIAN — absolutely NO meat, chicken, fish, or egg in any item; names short and clear.`;

    const result = await generateWithGateway(
      {
        model: "gemini-3.1-flash-lite",
        generationConfig: {
          maxOutputTokens: 1200,
          temperature: 0.5,
          responseMimeType: "application/json",
        },
      },
      prompt
    );
    const text = result.response.text();
    try {
      return NextResponse.json({ bank: JSON.parse(text) });
    } catch {
      return NextResponse.json({ bank: null, text });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "failed" }, { status: 500 });
  }
}
