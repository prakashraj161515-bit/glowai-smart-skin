// /api/price?asin=B0G4WQX1WR&domain=www.amazon.in&symbol=₹
// Scrapes the LIVE Amazon price (for the visitor's local marketplace) and caches
// it for 1 hour. When Amazon changes the price, the app reflects it within ~1h.
// Returns { price: "₹149", mrp: "₹199" | null } or { price: null }.

import { NextRequest, NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// allowed Amazon marketplaces (security: never fetch arbitrary hosts)
const ALLOWED_DOMAINS = new Set([
  "www.amazon.in", "www.amazon.com", "www.amazon.co.uk", "www.amazon.ca",
  "www.amazon.com.au", "www.amazon.ae", "www.amazon.sg", "www.amazon.de",
  "www.amazon.fr", "www.amazon.it", "www.amazon.es", "www.amazon.co.jp",
]);

// thresholds differ a lot by currency (₹ vs $); use a loose universal range
const sane = (n: number) => Number.isFinite(n) && n >= 1 && n < 1000000;

// Pull the MAIN buy price only — scope to Amazon's core price containers so we
// never grab an EMI amount, a "frequently bought together" price, or a
// sponsored/related-product price.
function extractPrice(html: string, sym: string): { price: string | null; mrp: string | null } {
  const fmt = (n: number) => `${sym}${n.toLocaleString("en-IN")}`;

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
      if (sane(n)) return { price: fmt(n), mrp: mrpFrom(html, sym) };
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
    const scope = html.slice(start, start + 4000);
    const m = scope.match(/class="a-price-whole"[^>]*>\s*([\d,]+)/);
    if (m) {
      const n = parseInt(m[1].replace(/,/g, ""), 10);
      if (sane(n)) return { price: fmt(n), mrp: mrpFrom(html, sym) };
    }
    const off = scope.match(/class="a-offscreen"[^>]*>\s*[^\d]{0,4}([\d,]+(?:\.\d+)?)/);
    if (off) {
      const n = Math.round(parseFloat(off[1].replace(/,/g, "")));
      if (sane(n)) return { price: fmt(n), mrp: mrpFrom(html, sym) };
    }
  }

  // 3) Legacy single-price ids
  for (const re of [
    /id="priceblock_ourprice"[^>]*>\s*[^\d]{0,4}([\d,]+(?:\.\d+)?)/,
    /id="priceblock_dealprice"[^>]*>\s*[^\d]{0,4}([\d,]+(?:\.\d+)?)/,
  ]) {
    const m = html.match(re);
    if (m) {
      const n = Math.round(parseFloat(m[1].replace(/,/g, "")));
      if (sane(n)) return { price: fmt(n), mrp: mrpFrom(html, sym) };
    }
  }

  return { price: null, mrp: null };
}

function mrpFrom(html: string, sym: string): string | null {
  const m = html.match(/"strikeThroughPrice"[^}]*?"amount"\s*:\s*([\d.]+)/)
    || html.match(/class="a-price a-text-price"[^>]*>[\s\S]{0,80}?class="a-offscreen"[^>]*>\s*[^\d]{0,4}([\d,]+(?:\.\d+)?)/);
  if (m) {
    const n = Math.round(parseFloat(String(m[1]).replace(/,/g, "")));
    if (sane(n)) return `${sym}${n.toLocaleString("en-IN")}`;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const asin = req.nextUrl.searchParams.get("asin");
  if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
    return NextResponse.json({ price: null }, { status: 400 });
  }

  // local marketplace from the visitor's geo (default amazon.in / ₹)
  let domain = req.nextUrl.searchParams.get("domain") || "www.amazon.in";
  if (!ALLOWED_DOMAINS.has(domain)) domain = "www.amazon.in";
  const symbol = (req.nextUrl.searchParams.get("symbol") || "₹").slice(0, 4);

  const tryFetch = async (dom: string, sym: string) => {
    const res = await fetch(`https://${dom}/dp/${asin}`, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return extractPrice(await res.text(), sym);
  };

  try {
    // 1) try the visitor's local marketplace
    let result = await tryFetch(domain, symbol);
    // 2) these are mostly Indian products — if not sold on the local store,
    //    fall back to amazon.in (₹) so the user still sees a real price + can buy
    if ((!result || !result.price) && domain !== "www.amazon.in") {
      result = await tryFetch("www.amazon.in", "₹");
    }
    return NextResponse.json(result || { price: null }, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=21600" },
    });
  } catch {
    return NextResponse.json({ price: null });
  }
}
