import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { d1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userData: any = null;
    const rows = await d1Query("SELECT data FROM users WHERE email = ?", [
      session.user.email,
    ]);
    if (rows && rows[0]?.data) {
      try {
        userData = JSON.parse(rows[0].data);
      } catch {}
    }

    return NextResponse.json({ data: userData });
  } catch (err: any) {
    console.error("Load error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
