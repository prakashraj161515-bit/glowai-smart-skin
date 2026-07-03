// ── Cream Premium gating ─────────────────────────────────────────────
// Free vs Premium limits, all in one place.
//
// FREE:
//   • 1 face scan per day (onboarding scan is NOT counted)
//   • 3 Aura chats per day
//   • Product Scanner    → Premium only
//   • Ingredient Checker → Premium only
//   • My Progress        → weekly view only (no 3M / All)
//   • Skin Diary         → keep only the last 7 entries
//   • Ads shown
// PREMIUM:
//   • Everything unlimited + ad-free

export const FREE_FACE_SCANS_PER_DAY = 1;
export const FREE_CHATS_PER_DAY = 3;
export const FREE_DIARY_ENTRIES = 7;

export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("velmora_is_premium") !== "true") return false;
  // Subscription auto-ends only when the paid term is over (not mid-term).
  const until = parseInt(localStorage.getItem("velmora_premium_until") || "0") || 0;
  if (until && Date.now() > until) {
    try { localStorage.setItem("velmora_is_premium", "false"); } catch {}
    return false;
  }
  return true;
}

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, stable

// generic per-day counter
function dayCount(key: string): number {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "{}");
    return raw.date === today() ? (raw.n || 0) : 0;
  } catch { return 0; }
}
function bumpDay(key: string) {
  const n = dayCount(key) + 1;
  localStorage.setItem(key, JSON.stringify({ date: today(), n }));
  return n;
}

// ── Face scans ──
export function faceScansLeft(): number {
  if (isPremium()) return Infinity;
  return Math.max(0, FREE_FACE_SCANS_PER_DAY - dayCount("cream_face_scans"));
}
export function canFaceScan(): boolean { return faceScansLeft() > 0; }
// onboardingScan = the very first scan during onboarding → not counted
export function recordFaceScan(onboardingScan = false) {
  if (isPremium() || onboardingScan) return;
  bumpDay("cream_face_scans");
}

// ── Aura chats ──
export function chatsLeft(): number {
  if (isPremium()) return Infinity;
  return Math.max(0, FREE_CHATS_PER_DAY - dayCount("cream_chats"));
}
export function canChat(): boolean { return chatsLeft() > 0; }
export function recordChat() { if (!isPremium()) bumpDay("cream_chats"); }
