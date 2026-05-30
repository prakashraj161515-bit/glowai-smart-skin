// Global product ratings — shared across ALL users via Vercel KV.
// GET  /api/ratings            -> { ratings: { [asin]: { sum, count } } }
// POST /api/ratings { asin, rating, prev } -> updates the aggregate
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const KEY = "velmora:global_ratings";
type Agg = Record<string, { sum: number; count: number }>;

export async function GET() {
  try {
    const ratings = (await kv.get<Agg>(KEY)) || {};
    return NextResponse.json({ ratings }, { headers: { "Cache-Control": "public, max-age=30, s-maxage=30" } });
  } catch {
    return NextResponse.json({ ratings: {} });
  }
}

export async function POST(req: Request) {
  try {
    const { asin, rating, prev } = await req.json();
    if (!asin || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "bad input" }, { status: 400 });
    }
    const all = (await kv.get<Agg>(KEY)) || {};
    const cur = all[asin] || { sum: 0, count: 0 };
    if (prev && prev >= 1 && prev <= 5) {
      // user is changing their existing rating — adjust sum, keep count
      cur.sum += rating - prev;
    } else {
      cur.sum += rating;
      cur.count += 1;
    }
    if (cur.sum < 0) cur.sum = 0;
    all[asin] = cur;
    await kv.set(KEY, all);
    return NextResponse.json({ ok: true, asin, agg: cur });
  } catch (err: any) {
    // KV not configured (local dev) — succeed silently so UI still works
    return NextResponse.json({ ok: false, error: err?.message });
  }
}
