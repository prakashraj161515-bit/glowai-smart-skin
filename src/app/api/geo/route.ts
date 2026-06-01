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

  const countryName = COUNTRY_NAME[country] || (country || "");
  const isSouthAsia = SOUTH_ASIA.has(country);

  return NextResponse.json({
    country: countryName,
    city,
    region,
    foodRegion: isSouthAsia ? "india" : (country ? "global" : ""),
    area: city ? `${city}${countryName ? ", " + countryName : ""}` : countryName,
  }, { headers: { "Cache-Control": "private, max-age=86400" } });
}
