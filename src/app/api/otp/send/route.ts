// POST /api/otp/send  { email }
// Generates a 6-digit code, stores it in Vercel KV for 10 min, emails it.
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    }
    const key = email.toLowerCase().trim();

    // simple rate-limit: max 5 sends / hour per email
    const rlKey = `otp:rl:${key}`;
    const sends = (await kv.get<number>(rlKey)) || 0;
    if (sends >= 5) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    // 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await kv.set(`otp:code:${key}`, code, { ex: 600 }); // expires in 10 min
    await kv.set(rlKey, sends + 1, { ex: 3600 });

    // send the email
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.OTP_FROM_EMAIL || "Cream <onboarding@resend.dev>";
    if (!apiKey) {
      // No email provider configured yet — return the code so dev/testing still works.
      console.warn("RESEND_API_KEY missing — returning code in response (dev only)");
      return NextResponse.json({ ok: true, devCode: code });
    }
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: key,
      subject: `${code} is your Cream login code`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#2C1F1A">
          <h2 style="margin:0 0 6px">Your login code</h2>
          <p style="color:#6b5b52;margin:0 0 18px">Enter this code in the Cream app to sign in.</p>
          <div style="font-size:34px;font-weight:800;letter-spacing:8px;background:#FDEDE7;color:#C44E28;padding:16px;border-radius:14px;text-align:center">${code}</div>
          <p style="color:#9b8b82;font-size:13px;margin:18px 0 0">This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
        </div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("OTP send error:", err);
    return NextResponse.json({ error: "Could not send code" }, { status: 500 });
  }
}
