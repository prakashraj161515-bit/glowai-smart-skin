import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userKey = `velmora:user:${session.user.email}`;

    let existing: any = {};
    let kvSuccess = false;

    try {
      existing = await kv.get(userKey) || {};
      const updated = {
        ...existing,
        ...body,
        email: session.user.email,
        name: session.user.name,
        updatedAt: new Date().toISOString(),
      };
      await kv.set(userKey, updated);
      kvSuccess = true;
    } catch (kvErr: any) {
      console.warn("KV save failed (using localStorage fallback):", kvErr.message);
    }

    return NextResponse.json({ success: true, kvSuccess });
  } catch (err: any) {
    console.error("Save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
