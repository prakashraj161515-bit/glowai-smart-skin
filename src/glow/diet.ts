// Personalised, region-aware diet plan generator.
// - Driven by the user's real face-scan concerns (acne / oil / pigmentation / hydration)
// - 7 days of VARIETY (each day different foods)
// - Cached for a week; only regenerates on a new scan or after 7 days.

export type Food = { name: string; emoji: string; why: string };
export type Meal = { meal: string; icon: string; time: string; items: Food[] };
export type DayPlan = { meals: Meal[]; focus: string };

type Scan = { acne?: number; oil?: number; pigmentation?: number; hydration?: number; score?: number };

// ── food banks (region + concern aware) ──────────────────────────────────
const BANK_INDIA = {
  breakfast: [
    { name: "Poha with peanuts", emoji: "🍚", why: "Light, iron-rich" },
    { name: "Vegetable upma", emoji: "🥣", why: "Fibre + steady energy" },
    { name: "Moong dal chilla", emoji: "🥞", why: "Plant protein" },
    { name: "Idli with sambar", emoji: "🍚", why: "Fermented, gut-friendly" },
    { name: "Besan chilla", emoji: "🥞", why: "Protein, controls oil" },
    { name: "Fruit + curd bowl", emoji: "🥣", why: "Probiotics + vitamins" },
    { name: "Ragi porridge", emoji: "🥣", why: "Calcium, calms skin" },
  ],
  lunch: [
    { name: "Dal + brown rice", emoji: "🍛", why: "Protein + clean carbs" },
    { name: "Rajma + roti", emoji: "🍛", why: "Fibre + protein" },
    { name: "Palak paneer + roti", emoji: "🥬", why: "Iron, fights dullness" },
    { name: "Chana masala bowl", emoji: "🫘", why: "Zinc for healing" },
    { name: "Veg khichdi + curd", emoji: "🍲", why: "Easy-digest, calming" },
    { name: "Fish curry + rice", emoji: "🐟", why: "Omega-3, plumps skin" },
    { name: "Mixed veg + roti", emoji: "🥗", why: "Antioxidants" },
  ],
  dinner: [
    { name: "Grilled paneer + salad", emoji: "🥗", why: "Collagen support" },
    { name: "Lauki sabzi + roti", emoji: "🥒", why: "Hydrating, light" },
    { name: "Tinda/veg + dal", emoji: "🍲", why: "Gentle on digestion" },
    { name: "Tandoori chicken + salad", emoji: "🍗", why: "Lean protein" },
    { name: "Tofu bhurji + roti", emoji: "🍳", why: "Plant protein" },
    { name: "Veg soup + multigrain toast", emoji: "🍵", why: "Warm, low-oil" },
    { name: "Bhindi + dal + rice", emoji: "🍛", why: "Fibre + minerals" },
  ],
  snack: [
    { name: "Coconut water", emoji: "🥥", why: "Hydration + minerals" },
    { name: "Amla juice", emoji: "🟢", why: "Vitamin C, brightening" },
    { name: "Soaked almonds", emoji: "🌰", why: "Vitamin E, repair" },
    { name: "Seasonal fruit", emoji: "🍊", why: "Vitamin C" },
    { name: "Roasted chana", emoji: "🫘", why: "Protein, low-GI" },
    { name: "Buttermilk (chaas)", emoji: "🥛", why: "Probiotic, cooling" },
    { name: "Green tea", emoji: "🍵", why: "Flushes toxins" },
  ],
};

const BANK_GLOBAL = {
  breakfast: [
    { name: "Greek yogurt + berries", emoji: "🫐", why: "Probiotics + antioxidants" },
    { name: "Oatmeal + banana", emoji: "🥣", why: "Steady energy, low GI" },
    { name: "Veggie omelette", emoji: "🍳", why: "Protein + biotin" },
    { name: "Green smoothie", emoji: "🥬", why: "Vitamins for glow" },
    { name: "Avocado toast", emoji: "🥑", why: "Healthy fats" },
    { name: "Chia pudding", emoji: "🥣", why: "Omega-3, hydrating" },
    { name: "Fruit + nut bowl", emoji: "🍓", why: "Vitamin C + E" },
  ],
  lunch: [
    { name: "Grilled salmon + greens", emoji: "🐟", why: "Omega-3, plumps skin" },
    { name: "Quinoa salad", emoji: "🥗", why: "Protein + fibre" },
    { name: "Chicken + veg bowl", emoji: "🍗", why: "Collagen building" },
    { name: "Lentil soup + bread", emoji: "🍲", why: "Iron + fibre" },
    { name: "Tofu stir-fry", emoji: "🍱", why: "Plant protein" },
    { name: "Tuna + spinach wrap", emoji: "🌯", why: "Omega-3 + iron" },
    { name: "Chickpea bowl", emoji: "🫘", why: "Zinc for healing" },
  ],
  dinner: [
    { name: "Baked fish + veggies", emoji: "🐟", why: "Lean omega-3" },
    { name: "Roasted veg + sweet potato", emoji: "🍠", why: "Vitamin A, repair" },
    { name: "Grilled chicken salad", emoji: "🥗", why: "Lean protein" },
    { name: "Veg & bean stew", emoji: "🍲", why: "Fibre + antioxidants" },
    { name: "Tofu + broccoli", emoji: "🥦", why: "Vitamin C, firming" },
    { name: "Turkey + greens", emoji: "🍗", why: "Zinc + protein" },
    { name: "Miso soup + rice", emoji: "🍵", why: "Probiotic, light" },
  ],
  snack: [
    { name: "Walnuts", emoji: "🌰", why: "Omega-3 + vitamin E" },
    { name: "Citrus fruit", emoji: "🍊", why: "Vitamin C, brightening" },
    { name: "Carrot sticks", emoji: "🥕", why: "Beta-carotene" },
    { name: "Pumpkin seeds", emoji: "🎃", why: "Zinc for acne" },
    { name: "Green tea", emoji: "🍵", why: "Detox + calm" },
    { name: "Blueberries", emoji: "🫐", why: "Antioxidants" },
    { name: "Cucumber + hummus", emoji: "🥒", why: "Hydrating snack" },
  ],
};

const INDIA_COUNTRIES = ["India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal"];

// concern-driven extra foods injected by what the scan found
function concernBoosts(scan: Scan, region: "india" | "global"): Food[] {
  const out: Food[] = [];
  const acne = scan.acne ?? 0, oil = scan.oil ?? 0, pig = scan.pigmentation ?? 0, hyd = scan.hydration ?? 60;
  if (acne >= 35) out.push(region === "india"
    ? { name: "Turmeric (haldi) milk", emoji: "🥛", why: "Anti-inflammatory for acne" }
    : { name: "Pumpkin seeds", emoji: "🎃", why: "Zinc fights acne" });
  if (oil >= 50) out.push(region === "india"
    ? { name: "Green tea (sugar-free)", emoji: "🍵", why: "Balances excess oil" }
    : { name: "Green tea", emoji: "🍵", why: "Balances excess oil" });
  if (pig >= 35) out.push(region === "india"
    ? { name: "Amla / citrus", emoji: "🟢", why: "Vitamin C fades dark spots" }
    : { name: "Oranges / kiwi", emoji: "🍊", why: "Vitamin C fades dark spots" });
  if (hyd < 45) out.push(region === "india"
    ? { name: "Cucumber + coconut water", emoji: "🥒", why: "Deeply hydrating" }
    : { name: "Watermelon / cucumber", emoji: "🍉", why: "Deeply hydrating" });
  return out;
}

function topFocus(scan: Scan): string {
  const acne = scan.acne ?? 0, oil = scan.oil ?? 0, pig = scan.pigmentation ?? 0, hyd = scan.hydration ?? 60;
  const ranked: [string, number][] = [["clear breakouts", acne], ["control oil", oil], ["fade dark spots", pig], ["boost hydration", 100 - hyd]];
  ranked.sort((a, b) => b[1] - a[1]);
  return ranked[0][1] > 30 ? ranked[0][0] : "maintain your glow";
}

function pick(bank: Food[], dayIdx: number, n: number): Food[] {
  const out: Food[] = [];
  for (let i = 0; i < n; i++) out.push(bank[(dayIdx * 2 + i) % bank.length]);
  return out;
}

// Build a 7-day plan personalised to the scan + region
export function buildWeekPlan(country: string, scan: Scan) {
  const region = INDIA_COUNTRIES.includes(country) ? "india" : "global";
  const bank = region === "india" ? BANK_INDIA : BANK_GLOBAL;
  const boosts = concernBoosts(scan, region);
  const days: DayPlan[] = Array.from({ length: 7 }).map((_, d) => {
    const meals: Meal[] = [
      { meal: "Breakfast", icon: "🌅", time: "8:00 AM", items: pick(bank.breakfast, d, 2) },
      { meal: "Lunch", icon: "☀️", time: "1:00 PM", items: pick(bank.lunch, d, 2) },
      { meal: "Dinner", icon: "🌙", time: "8:00 PM", items: pick(bank.dinner, d, 2) },
      { meal: "Snacks", icon: "🍵", time: "Anytime", items: [...pick(bank.snack, d, 1), ...(boosts.length ? [boosts[d % boosts.length]] : [])] },
    ];
    return { meals, focus: topFocus(scan) };
  });
  return {
    days,
    avoid: ["Fried / oily snacks", "Excess sugar & sweets", "Too much dairy (if acne-prone)", "Sugary sodas"],
    region: region === "india" ? country : "Global",
    focus: topFocus(scan),
  };
}

// localized subscription pricing by country — 3 tiers (monthly / 6-month / yearly)
export type Plan = { id: "monthly" | "sixmo" | "yearly"; label: string; period: string; amount: number; sub: string; best?: boolean };
export type Pricing = { symbol: string; fmt: (n: number) => string; plans: Plan[] };

export function pricing(country: string): Pricing {
  const inr = (n: number): string => "₹" + n.toLocaleString("en-IN");
  const sym = (s: string) => (n: number) => `${s}${n.toLocaleString()}`;

  if (["India", "Nepal", "Sri Lanka"].includes(country)) {
    return {
      symbol: "₹", fmt: inr,
      plans: [
        { id: "monthly", label: "Monthly", period: "/mo", amount: 249, sub: "Billed monthly" },
        { id: "sixmo",   label: "6 Months", period: "/6mo", amount: 1200, sub: "≈ ₹200/mo · save 20%" },
        { id: "yearly",  label: "Yearly",  period: "/yr", amount: 2000, sub: "≈ ₹167/mo · best value", best: true },
      ],
    };
  }
  if (country === "Pakistan") return { symbol: "₨", fmt: sym("₨"), plans: [
    { id: "monthly", label: "Monthly", period: "/mo", amount: 900, sub: "Billed monthly" },
    { id: "sixmo", label: "6 Months", period: "/6mo", amount: 4500, sub: "save 20%" },
    { id: "yearly", label: "Yearly", period: "/yr", amount: 7500, sub: "best value", best: true } ] };
  if (country === "UK") return { symbol: "£", fmt: sym("£"), plans: [
    { id: "monthly", label: "Monthly", period: "/mo", amount: 4.99, sub: "Billed monthly" },
    { id: "sixmo", label: "6 Months", period: "/6mo", amount: 24, sub: "save 20%" },
    { id: "yearly", label: "Yearly", period: "/yr", amount: 39.99, sub: "best value", best: true } ] };
  if (country === "UAE") return { symbol: "AED", fmt: sym("AED "), plans: [
    { id: "monthly", label: "Monthly", period: "/mo", amount: 22, sub: "Billed monthly" },
    { id: "sixmo", label: "6 Months", period: "/6mo", amount: 109, sub: "save 20%" },
    { id: "yearly", label: "Yearly", period: "/yr", amount: 179, sub: "best value", best: true } ] };
  // default USD
  return { symbol: "$", fmt: sym("$"), plans: [
    { id: "monthly", label: "Monthly", period: "/mo", amount: 5.99, sub: "Billed monthly" },
    { id: "sixmo", label: "6 Months", period: "/6mo", amount: 29, sub: "save 20%" },
    { id: "yearly", label: "Yearly", period: "/yr", amount: 49.99, sub: "best value", best: true } ] };
}

// map a food name to a real (brand-free) food photo in /public/food
export function foodImg(name: string): string {
  const n = name.toLowerCase();
  const has = (...k: string[]) => k.some(x => n.includes(x));
  if (has("yogurt", "curd")) return "/food/yogurt.jpg";
  if (has("oat", "porridge", "upma", "poha", "ragi", "chia", "muesli")) return "/food/oats.jpg";
  if (has("egg", "omelette", "chilla", "bhurji", "idli")) return "/food/eggs.jpg";
  if (has("smoothie")) return "/food/smoothie.jpg";
  if (has("avocado", "toast")) return "/food/avocado.jpg";
  if (has("berries", "berry", "fruit", "kiwi")) return "/food/berries.jpg";
  if (has("salmon", "fish", "tuna")) return "/food/fish.jpg";
  if (has("salad", "greens", "veg ", "veggie", "broccoli", "spinach", "palak", "mixed veg", "bhindi", "lauki", "tinda")) return "/food/salad.jpg";
  if (has("chicken", "turkey", "paneer", "tofu", "tandoori", "rajma", "chana", "chickpea", "dal", "khichdi", "curry", "stew")) return "/food/chicken.jpg";
  if (has("soup", "miso")) return "/food/soup.jpg";
  if (has("walnut", "almond", "nut", "seed", "chana", "pumpkin")) return "/food/nuts.jpg";
  if (has("tea", "water", "coconut", "buttermilk", "chaas", "amla", "citrus", "orange", "watermelon", "cucumber")) return "/food/tea.jpg";
  return "/food/salad.jpg";
}

// real (brand-free) skincare product photo by name — crops of the verified
// unbranded flatlay, positioned to a different product per type
export function skinImg(name: string): { src: string; pos: string } {
  const n = name.toLowerCase();
  const src = "/hero-product.jpg";
  if (n.includes("cleanser") || n.includes("wash")) return { src, pos: "92% 60%" };   // white tube
  if (n.includes("vitamin c") || n.includes("serum")) return { src, pos: "10% 38%" };  // amber dropper
  if (n.includes("niacinamide")) return { src, pos: "4% 60%" };                          // amber bottle
  if (n.includes("spf") || n.includes("shield") || n.includes("sun")) return { src, pos: "78% 92%" }; // tube
  if (n.includes("moistur") || n.includes("cream")) return { src, pos: "44% 50%" };      // compact/jar
  if (n.includes("night") || n.includes("repair") || n.includes("barrier")) return { src, pos: "30% 86%" };
  if (n.includes("toner")) return { src, pos: "16% 70%" };
  return { src, pos: "20% 60%" };
}

export function detectCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const map: Record<string, string> = {
      "Asia/Kolkata": "India", "Asia/Karachi": "Pakistan", "Asia/Dhaka": "Bangladesh",
      "Asia/Colombo": "Sri Lanka", "Asia/Kathmandu": "Nepal",
      "America/New_York": "USA", "America/Chicago": "USA", "America/Denver": "USA",
      "America/Los_Angeles": "USA", "Europe/London": "UK", "Asia/Dubai": "UAE",
      "Australia/Sydney": "Australia", "Asia/Singapore": "Singapore",
    };
    return map[tz] || "Global";
  } catch { return "Global"; }
}

// Detect a finer AREA (e.g. region within India) so the diet feels truly local.
// Uses the IANA timezone, which the browser already exposes. Returns a short
// area label and (for India) a region key used to bias the food bank.
export type AreaInfo = { country: string; area: string; region: string };
export function detectArea(): AreaInfo {
  let tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch {}
  const country = detectCountry();
  // India is a single timezone (Asia/Kolkata), so we can't get the state from TZ
  // alone — but we can offer a sensible pan-Indian healthy plan and let the user
  // see their detected country/area. For other countries we surface the city.
  const city = tz.split("/")[1]?.replace(/_/g, " ") || "";
  if (country === "India" || country === "Pakistan" || country === "Bangladesh" || country === "Nepal" || country === "Sri Lanka") {
    return { country, area: country, region: "india" };
  }
  return { country, area: city || country, region: "global" };
}

// ── weekly cache ──────────────────────────────────────────────────────────
const WEEK = 7 * 24 * 60 * 60 * 1000;
function scanSig(scan: Scan): string {
  return [scan.acne, scan.oil, scan.pigmentation, scan.hydration, scan.score].join("-");
}

// Returns a cached plan; regenerates only if (a) older than a week, or
// (b) the underlying scan changed (a new scan was done).
export function getWeekPlan(country: string, scan: Scan) {
  try {
    const raw = localStorage.getItem("velmora_diet_plan");
    if (raw) {
      const c = JSON.parse(raw);
      const fresh = Date.now() - (c.createdAt || 0) < WEEK;
      const sameScan = c.sig === scanSig(scan);
      const sameRegion = c.country === country;
      if (fresh && sameScan && sameRegion && c.plan) return c.plan;
    }
  } catch {}
  const plan = buildWeekPlan(country, scan);
  try {
    localStorage.setItem("velmora_diet_plan", JSON.stringify({ plan, createdAt: Date.now(), sig: scanSig(scan), country }));
  } catch {}
  return plan;
}

export function planAgeDays(): number {
  try {
    const raw = localStorage.getItem("velmora_diet_plan");
    if (raw) { const c = JSON.parse(raw); return Math.floor((Date.now() - (c.createdAt || 0)) / (24 * 60 * 60 * 1000)); }
  } catch {}
  return 0;
}
