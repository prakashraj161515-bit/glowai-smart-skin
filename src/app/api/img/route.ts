// /api/img?url=<encoded_amazon_cdn_url>
// Proxies a specific Amazon CDN image URL server-side so hotlink block is bypassed.
// The image URL is stored once in affiliate.ts (extracted when product is added).
// 24-hour CDN cache — subsequent requests are served from Vercel edge instantly.

import { NextRequest, NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return new NextResponse("Missing url param", { status: 400 });

  let imgUrl: string;
  try {
    imgUrl = decodeURIComponent(raw);
  } catch {
    return new NextResponse("Bad url param", { status: 400 });
  }

  // Only allow Amazon CDN domains for security
  const allowed = ["m.media-amazon.com", "images-na.ssl-images-amazon.com", "images-eu.ssl-images-amazon.com"];
  const host = new URL(imgUrl).hostname;
  if (!allowed.includes(host)) {
    return new NextResponse("Only Amazon CDN URLs allowed", { status: 403 });
  }

  try {
    const imgRes = await fetch(imgUrl, {
      headers: {
        "User-Agent": UA,
        "Referer": "https://www.amazon.in/",
        "Accept": "image/webp,image/jpeg,image/*",
      },
      next: { revalidate: 86400 }, // Next.js cache 24h
    });

    if (!imgRes.ok) {
      return new NextResponse(`Image fetch failed: ${imgRes.status}`, { status: 502 });
    }

    const data = await imgRes.arrayBuffer();
    const ct = imgRes.headers.get("content-type") || "image/jpeg";

    return new NextResponse(data, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("[/api/img]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}
