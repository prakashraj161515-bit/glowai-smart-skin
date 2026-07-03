// ── Cloudflare D1 (SQL) over REST ────────────────────────────────────────────
// The app runs on Vercel, so we talk to D1 through Cloudflare's HTTP query API.
// Credentials come from env vars; if any is missing we return null and the app
// just runs without cloud sync (no crash).
const CF_API = "https://api.cloudflare.com/client/v4";

function cfg() {
  const accountId = process.env.CF_ACCOUNT_ID;
  const dbId = process.env.CF_D1_DATABASE_ID;
  const token = process.env.CF_D1_API_TOKEN;
  if (!accountId || !dbId || !token) return null;
  return { accountId, dbId, token };
}

export function d1Configured(): boolean {
  return cfg() !== null;
}

/**
 * Run a single SQL statement on D1. Returns the result rows on success, or
 * null if D1 isn't configured / the query failed (caller decides fallback).
 */
export async function d1Query(
  sql: string,
  params: unknown[] = []
): Promise<any[] | null> {
  const c = cfg();
  if (!c) return null;
  try {
    const res = await fetch(
      `${CF_API}/accounts/${c.accountId}/d1/database/${c.dbId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${c.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params }),
      }
    );
    const json: any = await res.json();
    if (!json.success) {
      console.warn("D1 query failed:", JSON.stringify(json.errors));
      return null;
    }
    return json.result?.[0]?.results ?? [];
  } catch (e: any) {
    console.warn("D1 request error:", e?.message);
    return null;
  }
}
