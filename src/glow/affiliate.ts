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
export const DEFAULT_LINK = "https://amzn.to/4dDZDau";

// Fallback search links isi store + tag se banenge (jab DEFAULT_LINK bhi khaali ho).
export const AMAZON_DOMAIN = "www.amazon.in"; // e.g. www.amazon.com, www.amazon.co.uk
export const AMAZON_TAG = "";                 // e.g. "glowai-21"  (khaali chhod sakte ho)

// Per-product affiliate links — apne real links yaha paste karo.
export const AFFILIATE_LINKS: Record<string, string> = {
  "Gentle Gel Cleanser": "",
  "Gentle Cleanser (PM)": "",
  "Vitamin C Serum": "",
  "15% Vitamin C": "",
  "Quiet Hero 10%": "",
  "Niacinamide 10%": "",
  "Cloud Cream": "",
  "Cloud Cream Moisturizer": "",
  "Daily Shield SPF 50": "",
  "SPF Reapplication": "",
  "Spot Gel": "",
  "Barrier Repair Night Cream": "",
  "Barrier Repair Cream": "",
  "Clarifying BHA Toner": "",
  "Brightening Essence": "",
  "Retinol 0.3 Night": "",
  "Hydra Plump HA": "",
};

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
