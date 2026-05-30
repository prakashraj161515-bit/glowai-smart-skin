// ── Loyalty / streak-discount engine ───────────────────────────────────────
// Rules (confirmed):
// • Continuous daily-login streak. NOT reset by a purchase — only a missed
//   day breaks it.
// • A discount banks once the current 30-day cycle completes. The % GROWS
//   with the total streak: pct = 10 + floor((streak-30)/57), capped 20.
//   → 30 days = 10%, ~200 days = 13%.
// • First discount is free for everyone. Only ONE banked at a time; while
//   banked its % keeps rising with the streak until it is used.
// • Buying ANY plan (discounted or normal) consumes the offer and starts a
//   fresh 30-day cycle (streak keeps counting), so 30 more login days bank
//   the next, higher discount.

const todayStr = () => new Date().toLocaleDateString();
const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toLocaleDateString(); };
const get = (k: string, fb = "") => { try { return localStorage.getItem(k) ?? fb; } catch { return fb; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };

export type Loyalty = { streak: number; progress: number; banked: boolean; daysLeft: number; pct: number };

export function pctFromStreak(streak: number): number {
  if (streak < 30) return 0;
  return Math.min(20, 10 + Math.floor((streak - 30) / 57)); // 30→10, ~200→13
}

// Call on every app open. Updates streak + banks discount at 30 days.
export function tickLoyalty(): Loyalty {
  let streak = parseInt(get("velmora_streak", "0")) || 0;
  let anchor = parseInt(get("velmora_streak_anchor", "0")) || 0;
  let banked = get("velmora_discount_banked") === "1";
  let pct = parseInt(get("velmora_discount_pct", "0")) || 0;
  const last = get("velmora_last_login_date");
  const today = todayStr();

  if (last === today) {
    // already counted today
  } else if (last === yesterdayStr()) {
    streak += 1;
  } else if (last === "") {
    streak = streak > 1 ? streak : 1; // first load — keep any seeded streak
  } else {
    streak = 1; anchor = 0;            // missed a day → restart cycle; banked stays
  }
  set("velmora_last_login_date", today);
  set("velmora_streak", String(streak));

  if (!banked && streak - anchor >= 30) {
    banked = true; anchor = streak; pct = pctFromStreak(streak);
    set("velmora_discount_banked", "1");
  }
  if (banked) pct = Math.max(pct, pctFromStreak(streak)); // rises while pending
  set("velmora_streak_anchor", String(anchor));
  set("velmora_discount_pct", String(pct));

  const progress = banked ? 30 : Math.min(30, streak - anchor);
  return { streak, progress, banked, daysLeft: Math.max(0, 30 - progress), pct };
}

export function getLoyalty(): Loyalty {
  const streak = parseInt(get("velmora_streak", "0")) || 0;
  const anchor = parseInt(get("velmora_streak_anchor", "0")) || 0;
  const banked = get("velmora_discount_banked") === "1";
  const pct = banked ? Math.max(parseInt(get("velmora_discount_pct", "0")) || 0, pctFromStreak(streak)) : 0;
  const progress = banked ? 30 : Math.min(30, streak - anchor);
  return { streak, progress, banked, daysLeft: Math.max(0, 30 - progress), pct };
}

// Consume the banked discount on purchase and start a fresh 30-day cycle.
export function consumeDiscount() {
  set("velmora_discount_banked", "0");
  set("velmora_discount_pct", "0");
  const streak = parseInt(get("velmora_streak", "0")) || 0;
  set("velmora_streak_anchor", String(streak)); // next 30 days start now
  set("velmora_is_premium", "true");
  set("velmora_sub_since", todayStr());
}

// DEMO — preview the reward without waiting 30 days.
export function simulateStreak(days: number): Loyalty {
  set("velmora_streak", String(days));
  set("velmora_streak_anchor", "0");
  set("velmora_discount_banked", "0");
  set("velmora_discount_pct", "0");
  set("velmora_last_login_date", "");
  return tickLoyalty();
}
