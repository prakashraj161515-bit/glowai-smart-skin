// /api/ingredient  — AI lookup for ANY ingredient OR cream/product name.
// Returns a clean verdict so the Ingredient Checker can tell the user whether
// it's right or wrong for their skin, even for products not in our catalog.
import { NextResponse } from "next/server";
import { generateWithGateway } from "@/lib/ai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query || !query.trim()) {
      return NextResponse.json({ error: "empty" }, { status: 400 });
    }

    const prompt = `You are Cream's ingredient & product expert. The user typed: "${query}".
This may be a single skincare INGREDIENT (e.g. niacinamide) OR a full CREAM / PRODUCT name
(e.g. "Ponds Super Light Gel", "Garnier Vitamin C Face Wash", or even a misspelled one).

Identify it (best guess if the spelling is off) and judge it for everyday facial skincare.

Return ONLY valid JSON in this EXACT shape:
{
  "name": "<the corrected/proper name of the ingredient or product>",
  "kind": "<'ingredient' or 'product'>",
  "verdict": "<exactly one of: good | caution | avoid>",
  "verdictLabel": "<2-4 words, e.g. 'Good for you', 'Use with care', 'Best avoided'>",
  "note": "<ONE clear, friendly sentence (max 28 words) saying what it is and whether it suits most skin. Simple words.>",
  "bestFor": "<who/what skin type it suits, max 8 words. '' if unknown>",
  "keyActives": ["<0-4 main actives/ingredients, each 1-3 words>"]
}
Be honest: if it's a medicine/non-skincare/harsh item, use verdict 'avoid'.`;

    const result = await generateWithGateway({
      model: "gemini-3.1-flash-lite",
      generationConfig: { maxOutputTokens: 500, temperature: 0.3, responseMimeType: "application/json" },
    }, prompt);
    const text = result.response.text();
    try {
      return NextResponse.json({ result: JSON.parse(text) });
    } catch {
      return NextResponse.json({ result: null, text });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "failed" }, { status: 500 });
  }
}
