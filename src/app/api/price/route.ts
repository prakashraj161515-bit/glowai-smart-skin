// /api/price?asin=B0G4WQX1WR
// Scrapes the LIVE Amazon India price for a product and caches it for 1 hour.
// When Amazon changes the price, the app reflects it within ~1 hour automatically.
// Returns { price: "₹149", mrp: "₹199" | null } or { price: null }.

import { NextRequest, NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const sane = (n: number) => Number.isFinite(n) && n >= 20 && n < 100000;

// Pull the MAIN buy price only — scope to Amazon's core price containers so we
// never grab an EMI amount, a "frequently bought together" price, or a
// sponsored/related-product price (the old bug that made prices look "fake").
function extractPrice(html: string): { price: string | null; mrp: string | null } {
  // 1) Most reliable: JSON fields Amazon embeds for the actual buy price
  for (const re of [
    /"priceToPay"[^}]*?"amount"\s*:\s*([\d.]+)/,
    /"apexPriceToPay"[^}]*?"amount"\s*:\s*([\d.]+)/,
    /"priceAmount"\s*:\s*([\d.]+)/,
    /"buyingPrice"\s*:\s*([\d.]+)/,
  ]) {
    const m = html.match(re);
    if (m) {
      const n = Math.round(parseFloat(m[1]));
      if (sane(n)) return { price: fmt(n), mrp: mrpFrom(html) };
    }
  }

  // 2) Scope to a core price container, then read the first a-price-whole inside it
  const coreIds = [
    "corePriceDisplay_desktop_feature_div",
    "corePrice_feature_div",
    "corePrice_desktop",
    "apex_desktop",
  ];
  for (const id of coreIds) {
    const start = html.indexOf(`id="${id}"`);
    if (start === -1) continue;
    const scope = html.slice(start, start + 4000); // just this block
    const m = scope.match(/class="a-price-whole"[^>]*>\s*([\d,]+)/);
    if (m) {
      const n = parseInt(m[1].replace(/,/g, ""), 10);
      if (sane(n)) return { price: fmt(n), mrp: mrpFrom(html) };
    }
    // offscreen full price inside the same scope
    const off = scope.match(/class="a-offscreen"[^>]*>\s*₹\s*([\d,]+)/);
    if (off) {
      const n = parseInt(off[1].replace(/,/g, ""), 10);
      if (sane(n)) return { price: fmt(n), mrp: mrpFrom(html) };
    }
  }

  // 3) Legacy single-price ids
  for (const re of [
    /id="priceblock_ourprice"[^>]*>\s*₹\s*([\d,]+)/,
    /id="priceblock_dealprice"[^>]*>\s*₹\s*([\d,]+)/,
  ]) {
    const m = html.match(re);
    if (m) {
      const n = parseInt(m[1].replace(/,/g, ""), 10);
      if (sane(n)) return { price: fmt(n), mrp: mrpFrom(html) };
    }
  }

  return { price: null, mrp: null };
}

function mrpFrom(html: string): string | null {
  // strike-through list price (M.R.P.)
  const m = html.match(/"strikeThroughPrice"[^}]*?"amount"\s*:\s*([\d.]+)/)
    || html.match(/class="a-price a-text-price"[^>]*>[\s\S]{0,80}?class="a-offscreen"[^>]*>\s*₹\s*([\d,]+)/);
  if (m) {
    const n = Math.round(parseFloat(String(m[1]).replace(/,/g, "")));
    if (sane(n)) return fmt(n);
  }
  return null;
}

export async function GET(req: NextRequest) {
  const asin = req.nextUrl.searchParams.get("asin");
  if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
    return NextResponse.json({ price: null }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.amazon.in/dp/${asin}`, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
      },
      next: { revalidate: 3600 }, // refresh from Amazon every 1 hour
    });

    if (!res.ok) return NextResponse.json({ price: null });

    const html = await res.text();
    const result = extractPrice(html);

    return NextResponse.json(result, {
      // browser/CDN cache 1 h, serve stale up to 6 h while revalidating
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=21600" },
    });
  } catch {
    return NextResponse.json({ price: null });
  }
}
