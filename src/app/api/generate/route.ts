import { NextResponse } from "next/server";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { generateWithGateway } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let prompt = "";
    let imagePart: any = null;

    if (body.image) {
      const base64Data = body.image.includes(",") ? body.image.split(",")[1] : body.image;
      
      let mimeType = "image/jpeg";
      if (body.image.includes("data:image/png")) mimeType = "image/png";
      else if (body.image.includes("data:image/webp")) mimeType = "image/webp";

      imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };
    }

    const gender = body.gender || "user";

    // Face Scan: AI returns real JSON metrics
    let isFaceScan = false;
    let isProductScan = false;
    if (body.customPrompt) {
      prompt = body.customPrompt;
    } else if (body.mode === "product_scan") {
      isProductScan = true;
      prompt = `You are Cream, a world-class dermatologist. Look at the scanned skincare product image and identify it.

Return ONLY a valid JSON object, no extra text, in this EXACT format:
{
  "productName": "<the product name you see, e.g. 'Garnier Vitamin C Face Wash'. If unclear, your best guess>",
  "productType": "<one of: Cleanser, Serum, Moisturizer, Sunscreen, Toner, Night Cream, Treatment, Other>",
  "verdict": "<one of exactly: good | caution | avoid>",
  "verdictLabel": "<short 2-4 word verdict, e.g. 'Great for you', 'Use with care', 'Not recommended'>",
  "rating": <integer 1-5, how good this product is for general ${gender} skincare>,
  "summary": "<ONE friendly sentence (max 20 words) telling the ${gender} what this product is and whether to use it. Simple words.>",
  "keyIngredients": ["<3-5 main ingredients or actives, each 1-3 words>"],
  "goodFor": ["<2-3 short points: who/what skin this helps, each under 8 words>"],
  "watchOut": ["<1-3 short cautions, each under 8 words. If none, use a single item 'Generally safe for most skin'>"],
  "howToUse": "<one short sentence on when/how to use it>"
}
Be honest: if it's a medicine/prescription/non-skincare item, set verdict 'avoid' and explain in summary.`;
    } else if (body.message) {
      prompt = `
        You are Cream, a world-class dermatological assistant. 
        User (${gender}) Question: "${body.message}"
        Provide professional, gender-specific skincare advice.
      `;
    } else if (body.mode === "face_scan" || body.image) {
      // REAL AI FACE SCAN — returns structured JSON
      isFaceScan = true;
      const { userName = "User", country = "India" } = body;
      prompt = `You are Cream, a world-class AI dermatologist. Look VERY carefully at THIS specific face image and score the skin from what you ACTUALLY see. Do NOT give generic or "safe" middle numbers — be honest and precise so two different faces (or the same face on a better/worse day) get clearly different scores.

How to score (study the actual pixels):
- ACNE: count visible pimples, bumps, blemishes, breakouts. Clear skin = low (0-15). A few spots = 25-45. Many/cystic = 60-90.
- OIL: look for shine, greasy T-zone, visible sebum. Matte/dry = low. Very shiny = high.
- PIGMENTATION: dark spots, tan, uneven tone, melasma. Even tone = low. Many dark patches = high.
- REDNESS: irritation, rosacea, red patches.
- Then derive the OVERALL "score" (0-100, higher = healthier): start near 90 and SUBTRACT for every problem you see (more acne/oil/pigmentation/redness/large pores = lower score). A flawless face ≈ 88-96; clearly problematic skin ≈ 45-65; severe ≈ 25-45. Use the FULL range — avoid clustering everything around 75-80.

Base every number on real visual evidence in this exact photo. If the photo is blurry or no clear face, return score 0 and topConcern "Unclear photo".

Return ONLY a valid JSON object, no extra text, in this exact format:
{
  "score": <integer 0-100, overall skin-health score derived as above — vary it honestly>,
  "acne": <integer 0-100, acne severity>,
  "oil": <integer 0-100, oiliness level>,
  "pigmentation": <integer 0-100, dark spots level>,
  "hydration": <integer 0-100, how hydrated/plump the skin looks>,
  "texture": <integer 0-100, smoothness of skin texture, higher = smoother>,
  "redness": <integer 0-100, visible redness/irritation>,
  "poreSize": <integer 0-100, visible pore size, higher = larger pores>,
  "radiance": <integer 0-100, natural glow/radiance, higher = more radiant>,
  "topConcern": "<the single biggest skin concern in 1-3 words, e.g. 'Excess oil' or 'Dark spots'>",
  "summary": "<ONE warm, encouraging sentence (max 18 words) for ${userName} summarising their skin today in plain simple language a beginner understands. No jargon.>",
  "report": "<a SHORT, easy-to-read markdown report for ${userName} (${gender}). Use EXACTLY these 3 sections with simple words a non-expert understands: **WHAT WE SEE** (2-3 short bullets), **WHY** (2 short bullets on likely causes), **YOUR PLAN** (3 short actionable bullets — what to do + 1 food to eat available in ${country}). Keep every bullet under 14 words. Be friendly and motivating. No medical jargon.>"
}`;
    } else {
      prompt = `You are Cream, a world-class dermatological assistant. Provide professional skincare advice.`;
    }

    const content = imagePart ? [prompt, imagePart] : [prompt];

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const result = await generateWithGateway({
      model: "gemini-3.5-flash",
      generationConfig: {
        maxOutputTokens: 2000,
        // face scan: a touch higher so scores reflect real differences (not clustered ~78)
        temperature: isFaceScan ? 0.6 : 0.4,
        ...((isFaceScan || isProductScan) ? { responseMimeType: "application/json" } : {})
      },
      safetySettings,
    }, content);
    const text = result.response.text();

    if (isFaceScan) {
      try {
        const parsed = JSON.parse(text);
        return NextResponse.json({
          score: parsed.score,
          acne: parsed.acne,
          oil: parsed.oil,
          pigmentation: parsed.pigmentation,
          hydration: parsed.hydration,
          texture: parsed.texture,
          redness: parsed.redness,
          poreSize: parsed.poreSize,
          radiance: parsed.radiance,
          topConcern: parsed.topConcern || "",
          summary: parsed.summary || "",
          report: parsed.report,
          text: parsed.report
        });
      } catch {
        // If JSON parse fails, try to extract from text
        return NextResponse.json({ text });
      }
    }

    if (isProductScan) {
      try {
        const p = JSON.parse(text);
        return NextResponse.json({ product: p });
      } catch {
        return NextResponse.json({ text });
      }
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("🔥 Next.js AI Error:", err);
    return NextResponse.json({ error: "Failed to connect to AI: " + err.message }, { status: 500 });
  }
}
