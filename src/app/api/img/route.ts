// /api/img?asin=B0G4WQX1WR
// Server-side Amazon product image proxy — fetches the main product photo
// for any ASIN and serves it to the browser (avoids Amazon hotlink block).
// Next.js caches the Amazon page fetch for 24 h so repeat requests are fast.

import { NextRequest, NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Extract the main hi-res image URL from Amazon product page HTML
function extractImgUrl(html: string): string | null {
  // 1) hiRes JSON field (most reliable — main product image)
  const hiRes = html.match(/"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
  if (hiRes) return hiRes[1];

  // 2) data-old-hires attribute
  const oldHi = html.match(/data-old-hires="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
  if (oldHi) return oldHi[1];

  // 3) SL1500 / SL1080 image URL in colorImages block
  const sl = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/\w+\._[A-Z0-9_]+_SL(?:1500|1080|500)_\.jpg/);
  if (sl) return sl[0];

  // 4) Any m.media-amazon.com product image
  const any = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%+\-.]+\._AC_[A-Z0-9_]+_\.jpg/);
  if (any) return any[0];

  return null;
}

export async function GET(req: NextRequest) {
  const asin = req.nextUrl.searchParams.get("asin");

  // validate ASIN — 10 alphanumeric chars
  if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
    return new NextResponse("Bad request — provide a valid ASIN", { status: 400 });
  }

  try {
    // Fetch Amazon product page (cached 24 h by Next.js)
    const pageRes = await fetch(`https://www.amazon.in/dp/${asin}`, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 86400 }, // cache 24 h
    });

    if (!pageRes.ok) {
      return new NextResponse("Amazon page fetch failed", { status: 502 });
    }

    const html = await pageRes.text();
    const imgUrl = extractImgUrl(html);

    if (!imgUrl) {
      return new NextResponse("Could not find product image", { status: 404 });
    }

    // Fetch the actual image (server-side — no CORS issue)
    const imgRes = await fetch(imgUrl, {
      headers: {
        "User-Agent": UA,
        "Referer": "https://www.amazon.in/",
      },
      next: { revalidate: 86400 }, // cache 24 h
    });

    if (!imgRes.ok) {
      return new NextResponse("Image fetch failed", { status: 502 });
    }

    const data = await imgRes.arrayBuffer();
    const ct = imgRes.headers.get("content-type") || "image/jpeg";

    return new NextResponse(data, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
        "X-Image-Source": imgUrl,
      },
    });
  } catch (err) {
    console.error("[/api/img]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}
