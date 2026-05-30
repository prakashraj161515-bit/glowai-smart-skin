// Typo-tolerant + synonym-aware product search.
import type { AffProduct } from "./affiliate";

// words that map to a category (despaced keys)
const CAT_SYNONYMS: Record<string, string> = {
  facewash: "Cleanser", facewashcream: "Cleanser", cleanser: "Cleanser", cleaner: "Cleanser",
  cleansingwater: "Cleanser", micellar: "Cleanser", wash: "Cleanser",
  sunscreen: "SPF", spf: "SPF", sunblock: "SPF", sunprotection: "SPF",
  moisturizer: "Moisturizer", moisturiser: "Moisturizer", lotion: "Moisturizer",
  daycream: "Moisturizer", gelcream: "Moisturizer", facecream: "Moisturizer",
  serum: "Serum", faceserum: "Serum", essence: "Serum",
  toner: "Toner", facemist: "Toner", mist: "Toner",
  nightcream: "Night Cream", nightrepair: "Night Cream",
  treatment: "Treatment", facemask: "Treatment", mask: "Treatment", eyecream: "Treatment", undereye: "Treatment",
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const despace = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Levenshtein distance (small strings)
function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

// is query token "close" to a field token (handles small typos)
function close(field: string, q: string): boolean {
  if (field.includes(q) || q.includes(field)) return true;
  const maxD = q.length <= 4 ? 1 : q.length <= 7 ? 2 : 3;
  return lev(field, q) <= maxD;
}

// resolve a token/phrase to a category via synonyms (typo-tolerant)
function synonymCat(token: string): string | null {
  const d = despace(token);
  if (CAT_SYNONYMS[d]) return CAT_SYNONYMS[d];
  // fuzzy against synonym keys
  for (const key in CAT_SYNONYMS) {
    if (d.length >= 4 && lev(d, key) <= (d.length <= 6 ? 1 : 2)) return CAT_SYNONYMS[key];
  }
  return null;
}

export function scoreProduct(p: AffProduct, rawQuery: string): number {
  const q = norm(rawQuery);
  if (!q) return 1;
  const fields = norm(`${p.name} ${p.brand} ${p.cat} ${p.tags.join(" ")}`);
  const fTokens = fields.split(" ");
  let score = 0;

  // whole-query category synonym (e.g. "facewash cream" -> Cleanser)
  const wholeCat = synonymCat(q.replace(/\s/g, ""));
  if (wholeCat && p.cat === wholeCat) score += 6;

  // exact substring of full query
  if (fields.includes(q)) score += 5;
  if (despace(p.name).includes(despace(q)) || despace(p.brand).includes(despace(q))) score += 4;

  // per-token matching
  for (const qt of q.split(" ").filter(Boolean)) {
    const cat = synonymCat(qt);
    if (cat && p.cat === cat) { score += 4; continue; }
    if (fields.includes(qt)) { score += 3; continue; }
    if (fTokens.some(ft => close(ft, qt))) { score += 1; continue; }
  }
  return score;
}

export function searchProducts(all: AffProduct[], query: string): { p: AffProduct; score: number }[] {
  return all
    .map(p => ({ p, score: scoreProduct(p, query) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
}
