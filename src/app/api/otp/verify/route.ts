// POST /api/otp/verify  { email, code }
// Checks the code against KV. On success, returns ok so the client can sign in.
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
    }
    const key = email.toLowerCase().trim();
    const stored = await kv.get<string>(`otp:code:${key}`);

    if (!stored) {
      return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
    }
    if (String(code).trim() !== String(stored)) {
      return NextResponse.json({ error: "Wrong code. Try again." }, { status: 400 });
    }

    // success — burn the code so it can't be reused
    await kv.del(`otp:code:${key}`);
    return NextResponse.json({ ok: true, email: key });
  } catch (err: any) {
    console.error("OTP verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
