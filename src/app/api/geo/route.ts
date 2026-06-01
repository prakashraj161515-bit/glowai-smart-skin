// /api/geo  — detects the visitor's country + city/region from their IP,
// using the geo headers Vercel injects on the Edge (no permission prompt,
// no external API). Falls back gracefully when running locally.
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Vercel adds these headers automatically in production
  const h = req.headers;
  const country = h.get("x-vercel-ip-country") || "";       // e.g. "IN"
  const region = h.get("x-vercel-ip-country-region") || ""; // e.g. "MH"
  const city = decodeURIComponent(h.get("x-vercel-ip-city") || ""); // e.g. "Mumbai"

  const COUNTRY_NAME: Record<string, string> = {
    IN: "India", PK: "Pakistan", BD: "Bangladesh", NP: "Nepal", LK: "Sri Lanka",
    US: "USA", GB: "UK", AE: "UAE", AU: "Australia", SG: "Singapore", CA: "Canada",
  };
  const SOUTH_ASIA = new Set(["IN", "PK", "BD", "NP", "LK"]);

  // Map the visitor's country to the right Amazon marketplace + currency,
  // so prices/links shown are local to them.
  const AMZ: Record<string, { domain: string; currency: string; symbol: string }> = {
    IN: { domain: "www.amazon.in", currency: "INR", symbol: "₹" },
    US: { domain: "www.amazon.com", currency: "USD", symbol: "$" },
    GB: { domain: "www.amazon.co.uk", currency: "GBP", symbol: "£" },
    CA: { domain: "www.amazon.ca", currency: "CAD", symbol: "$" },
    AU: { domain: "www.amazon.com.au", currency: "AUD", symbol: "$" },
    AE: { domain: "www.amazon.ae", currency: "AED", symbol: "AED " },
    SG: { domain: "www.amazon.sg", currency: "SGD", symbol: "$" },
    DE: { domain: "www.amazon.de", currency: "EUR", symbol: "€" },
    FR: { domain: "www.amazon.fr", currency: "EUR", symbol: "€" },
    IT: { domain: "www.amazon.it", currency: "EUR", symbol: "€" },
    ES: { domain: "www.amazon.es", currency: "EUR", symbol: "€" },
    JP: { domain: "www.amazon.co.jp", currency: "JPY", symbol: "¥" },
  };
  // South-Asian neighbours don't have their own Amazon → use amazon.in (closest)
  const amz = AMZ[country] || (SOUTH_ASIA.has(country) ? AMZ.IN : AMZ.IN);

  const countryName = COUNTRY_NAME[country] || (country || "");
  const isSouthAsia = SOUTH_ASIA.has(country);

  return NextResponse.json({
    country: countryName,
    countryCode: country,
    city,
    region,
    foodRegion: isSouthAsia ? "india" : (country ? "global" : ""),
    area: city ? `${city}${countryName ? ", " + countryName : ""}` : countryName,
    amazonDomain: amz.domain,
    currency: amz.currency,
    currencySymbol: amz.symbol,
  }, { headers: { "Cache-Control": "private, max-age=86400" } });
}
