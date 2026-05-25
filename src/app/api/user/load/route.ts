import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userKey = `velmora:user:${session.user.email}`;
    let userData: any = null;

    try {
      userData = await kv.get(userKey);
    } catch (kvErr: any) {
      console.warn("KV get failed (using localStorage fallback):", kvErr.message);
    }

    return NextResponse.json({ data: userData });
  } catch (err: any) {
    console.error("Load error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
