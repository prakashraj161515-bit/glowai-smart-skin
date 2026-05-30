// /api/price?asin=B0G4WQX1WR
// Scrapes and caches the live Amazon India price for a product.
// Returns { price: "₹149", mrp: "₹199", discount: "25%" } or { price: null }

import { NextRequest, NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function extractPrice(html: string): { price: string | null; mrp: string | null; discount: string | null } {
  // 1) JSON data — "priceAmount" or "price":{"amount":...}
  const jsonPrice = html.match(/"priceAmount"\s*:\s*([\d.]+)/);
  if (jsonPrice) {
    const p = Math.round(parseFloat(jsonPrice[1]));
    return { price: `₹${p.toLocaleString("en-IN")}`, mrp: null, discount: null };
  }

  // 2) a-price-whole (most common on Amazon India)
  const wholeMatch = html.match(/class="a-price-whole"[^>]*>\s*([\d,]+)/);
  if (wholeMatch) {
    const p = parseInt(wholeMatch[1].replace(/,/g, ""));
    if (p > 0 && p < 100000) {
      // Try to get MRP
      const mrpMatch = html.match(/class="a-price a-text-price"[^>]*>[\s\S]*?class="a-offscreen"[^>]*>(₹[\d,]+)/);
      const mrp = mrpMatch ? mrpMatch[1] : null;
      // Try discount
      const discMatch = html.match(/(-\d+%)/);
      const discount = discMatch ? discMatch[1] : null;
      return { price: `₹${p.toLocaleString("en-IN")}`, mrp, discount };
    }
  }

  // 3) "buyingPrice" in JSON
  const buyMatch = html.match(/"buyingPrice"\s*:\s*([\d.]+)/);
  if (buyMatch) {
    const p = Math.round(parseFloat(buyMatch[1]));
    return { price: `₹${p.toLocaleString("en-IN")}`, mrp: null, discount: null };
  }

  return { price: null, mrp: null, discount: null };
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
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-IN,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      next: { revalidate: 21600 }, // cache 6 hours
    });

    if (!res.ok) return NextResponse.json({ price: null });

    const html = await res.text();
    const result = extractPrice(html);

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=21600, s-maxage=21600" },
    });
  } catch {
    return NextResponse.json({ price: null });
  }
}
