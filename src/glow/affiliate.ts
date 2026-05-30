// ═══════════════════════════════════════════════════════════════════════════
//  AFFILIATE LINKS  ·  EDIT THIS FILE ONLY
//  ---------------------------------------------------------------------------
//  Har product ke saamne uska apna affiliate URL paste karo (Amazon / Flipkart /
//  Nykaa / koi bhi). Jaha "" (khaali) hoga, woh apne-aap ek Amazon SEARCH link
//  pe chala jaayega taaki button kabhi toota na rahe.
//
//  Example:
//    "Gentle Gel Cleanser": "https://www.amazon.in/dp/XXXX?tag=yourtag-21",
//
//  Jab paisa kamana ho — bas yaha real links bhar do, baaki app khud handle
//  karega. Koi aur file chhune ki zaroorat nahi.
// ═══════════════════════════════════════════════════════════════════════════

// DEFAULT affiliate link — jab kisi product ka apna alag link na ho, har "Buy"
// button isi pe jaayega. Yaha apna main affiliate link daalo.
export const DEFAULT_LINK = ""; // khaali — naye products ke links aayenge

// Fallback search links isi store + tag se banenge (jab DEFAULT_LINK bhi khaali ho).
export const AMAZON_DOMAIN = "www.amazon.in"; // e.g. www.amazon.com, www.amazon.co.uk
export const AMAZON_TAG = "";                 // e.g. "glowai-21"  (khaali chhod sakte ho)

// Per-product affiliate links — apne real links yaha paste karo.
// ── Real products — name → { link, asin } ──────────────────────────────────
// Naya product add karna: yahan entry daalo.
// asin: Amazon product ID (URL mein /dp/XXXXXXXXXX wala)
// link: aapka affiliate link
// Photo automatically /api/img?asin=XXXX se aayegi — koi aur kaam nahi!
// ─────────────────────────────────────────────────────────────────────────────
export const PRODUCTS_DATA: Record<string, { link: string; asin?: string }> = {
  "Garnier Bright Complete Vitamin C Face Wash": {
    asin: "B0G4WQX1WR",
    link: "https://amzn.to/4dDZDau",
  },
  // aur products aane wale hain...
};

// backward-compat helper for BuyBtn
export const AFFILIATE_LINKS: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCTS_DATA).map(([k, v]) => [k, v.link])
);

// Returns the auto-proxied image URL for a product (via /api/img?asin=)
// Falls back to undefined if no ASIN set.
export function productImg(name: string): string | undefined {
  const d = PRODUCTS_DATA[name];
  if (d?.asin) return `/api/img?asin=${d.asin}`;
  return undefined;
}

// Returns the buy link for a product. Custom link if set, else an Amazon search.
export function affiliateUrl(name: string): string {
  const direct = AFFILIATE_LINKS[name];
  if (direct && direct.trim()) return direct.trim();      // 1) product ka apna link
  if (DEFAULT_LINK && DEFAULT_LINK.trim()) return DEFAULT_LINK.trim(); // 2) default link
  const q = encodeURIComponent(`${name} skincare`);       // 3) Amazon search fallback
  const tag = AMAZON_TAG ? `&tag=${encodeURIComponent(AMAZON_TAG)}` : "";
  return `https://${AMAZON_DOMAIN}/s?k=${q}${tag}`;
}

// True only when a real custom link has been pasted (lets the UI show a
// subtle "search" vs "buy" hint if you ever want it).
export function hasCustomLink(name: string): boolean {
  const v = AFFILIATE_LINKS[name];
  return !!(v && v.trim());
}
