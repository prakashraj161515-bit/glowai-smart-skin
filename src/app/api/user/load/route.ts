import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { kv } from "@vercel/kv";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userKey = `velmora:user:${session.user.email}`;
    const userData: any = await kv.get(userKey);

    return NextResponse.json({ data: userData || null });
  } catch (err: any) {
    console.error("Load error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
