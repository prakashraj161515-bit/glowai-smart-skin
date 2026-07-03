import { NextResponse } from "next/server";
import { d1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await d1Query("SELECT email, data FROM users");
    if (!rows) {
      return NextResponse.json({ error: "Failed to connect to D1 database or fetch users" }, { status: 500 });
    }

    let updatedCount = 0;
    for (const row of rows) {
      let data: any = {};
      try {
        data = JSON.parse(row.data);
      } catch {}

      if (data.isPremium || data.velmora_is_premium === "true" || data.premiumPlan || data.premiumUntil) {
        data.isPremium = false;
        data.velmora_is_premium = "false";
        data.premiumPlan = null;
        data.premiumUntil = 0;

        await d1Query("UPDATE users SET data = ? WHERE email = ?", [
          JSON.stringify(data),
          row.email,
        ]);
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database premium state successfully reset for ${updatedCount} users.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
