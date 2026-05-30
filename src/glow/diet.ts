// Localized diet plans for skin health — auto-selected by country.
// Each food has an emoji thumbnail (always renders) + name + benefit.

export type Food = { name: string; emoji: string; why: string };
export type Meal = { meal: string; icon: string; time: string; items: Food[] };

const INDIA: Meal[] = [
  { meal: "Breakfast", icon: "🌅", time: "8:00 AM", items: [
    { name: "Poha with peanuts", emoji: "🍚", why: "Light, iron-rich" },
    { name: "Amla juice", emoji: "🟢", why: "Vitamin C for glow" },
    { name: "Soaked almonds", emoji: "🌰", why: "Vitamin E, repairs skin" },
  ]},
  { meal: "Lunch", icon: "☀️", time: "1:00 PM", items: [
    { name: "Dal + brown rice", emoji: "🍛", why: "Protein + clean carbs" },
    { name: "Palak (spinach)", emoji: "🥬", why: "Iron, fights dullness" },
    { name: "Curd / buttermilk", emoji: "🥛", why: "Probiotics, calms acne" },
  ]},
  { meal: "Dinner", icon: "🌙", time: "8:00 PM", items: [
    { name: "Grilled paneer/fish", emoji: "🐟", why: "Collagen support" },
    { name: "Mixed veg sabzi", emoji: "🥗", why: "Antioxidants" },
    { name: "Turmeric milk (haldi)", emoji: "🥛", why: "Anti-inflammatory" },
  ]},
  { meal: "Snacks", icon: "🍵", time: "Anytime", items: [
    { name: "Coconut water", emoji: "🥥", why: "Hydration + minerals" },
    { name: "Seasonal fruit", emoji: "🍊", why: "Vitamin C" },
    { name: "Green tea", emoji: "🍵", why: "Flushes toxins" },
  ]},
];

const GLOBAL: Meal[] = [
  { meal: "Breakfast", icon: "🌅", time: "8:00 AM", items: [
    { name: "Greek yogurt + berries", emoji: "🫐", why: "Probiotics + antioxidants" },
    { name: "Oatmeal", emoji: "🥣", why: "Steady energy, low GI" },
    { name: "Green smoothie", emoji: "🥬", why: "Vitamins for glow" },
  ]},
  { meal: "Lunch", icon: "☀️", time: "1:00 PM", items: [
    { name: "Grilled salmon", emoji: "🐟", why: "Omega-3, plumps skin" },
    { name: "Quinoa salad", emoji: "🥗", why: "Protein + fiber" },
    { name: "Avocado", emoji: "🥑", why: "Healthy fats, hydration" },
  ]},
  { meal: "Dinner", icon: "🌙", time: "8:00 PM", items: [
    { name: "Lean chicken / tofu", emoji: "🍗", why: "Collagen building" },
    { name: "Roasted veggies", emoji: "🥦", why: "Antioxidants" },
    { name: "Sweet potato", emoji: "🍠", why: "Vitamin A, repairs skin" },
  ]},
  { meal: "Snacks", icon: "🍵", time: "Anytime", items: [
    { name: "Walnuts", emoji: "🌰", why: "Omega-3 + vitamin E" },
    { name: "Citrus fruit", emoji: "🍊", why: "Vitamin C, brightening" },
    { name: "Green tea", emoji: "🍵", why: "Detox + calm" },
  ]},
];

const AVOID = ["Fried / oily snacks", "Excess sugar & sweets", "Too much dairy (if acne-prone)", "Sugary sodas"];

const PLANS: Record<string, Meal[]> = {
  India: INDIA, Pakistan: INDIA, Bangladesh: INDIA, "Sri Lanka": INDIA, Nepal: INDIA,
};

export function dietForCountry(country: string): { plan: Meal[]; avoid: string[]; region: string } {
  const plan = PLANS[country] || GLOBAL;
  return { plan, avoid: AVOID, region: PLANS[country] ? country : "Global" };
}

// Detect country from timezone (no extra permissions)
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

// ── Skincare product thumbnails (emoji by category, always renders) ──
export function productEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("cleanser") || n.includes("wash")) return "🧼";
  if (n.includes("vitamin c") || n.includes("serum")) return "🧪";
  if (n.includes("niacinamide")) return "💧";
  if (n.includes("spf") || n.includes("shield") || n.includes("sun")) return "☀️";
  if (n.includes("moistur") || n.includes("cream")) return "🫙";
  if (n.includes("night") || n.includes("repair")) return "🌙";
  if (n.includes("toner")) return "🌸";
  return "🧴";
}
