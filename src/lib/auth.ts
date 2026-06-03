import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { kv } from "@vercel/kv";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Always show Google's account-chooser (never silent auto sign-in)
      authorization: { params: { prompt: "select_account" } },
    }),
    // Email + OTP code login
    CredentialsProvider({
      id: "email-otp",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const code = credentials?.code?.trim();
        if (!email || !code) return null;
        // re-verify the code server-side so it can't be faked from the client
        try {
          const stored = await kv.get<string>(`otp:code:${email}`);
          if (stored && String(stored) === code) {
            await kv.del(`otp:code:${email}`);
            return { id: "email-" + email, name: email.split("@")[0], email, image: null };
          }
        } catch (e) {
          console.error("OTP authorize error:", e);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "velmora-fallback-secret-key-2024",
  pages: {
    error: "/", 
  },
};
