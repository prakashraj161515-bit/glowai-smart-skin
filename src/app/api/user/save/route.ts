import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { d1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const email = session.user.email;
    const name = session.user.name ?? null;

    let cloudSuccess = false;

    // Read-modify-write so partial payloads (e.g. {isPremium:true}) merge with
    // whatever is already stored, instead of wiping the rest.
    const rows = await d1Query("SELECT data FROM users WHERE email = ?", [email]);
    if (rows !== null) {
      let existing: any = {};
      if (rows[0]?.data) {
        try {
          existing = JSON.parse(rows[0].data);
        } catch {}
      }
      const merged = {
        ...existing,
        ...body,
        email,
        name,
        updatedAt: new Date().toISOString(),
      };
      const res = await d1Query(
        `INSERT INTO users (email, data, name, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET
           data = excluded.data,
           name = excluded.name,
           updated_at = excluded.updated_at`,
        [email, JSON.stringify(merged), name, merged.updatedAt]
      );
      cloudSuccess = res !== null;
    }

    return NextResponse.json({ success: true, cloudSuccess });
  } catch (err: any) {
    console.error("Save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
