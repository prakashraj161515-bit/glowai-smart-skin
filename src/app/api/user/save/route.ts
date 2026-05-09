import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { kv } from "@vercel/kv";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userKey = `velmora:user:${session.user.email}`;

    // Load existing data
    const existing: any = await kv.get(userKey) || {};

    // Merge new data with existing
    const updated = {
      ...existing,
      ...body,
      email: session.user.email,
      name: session.user.name,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(userKey, updated);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
