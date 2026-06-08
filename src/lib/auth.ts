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
    // Native Google Sign-In (from the Flutter shell): the app signs in with the
    // native Google SDK and sends us the ID token, which we verify with Google.
    CredentialsProvider({
      id: "native-google",
      name: "Google",
      credentials: { idToken: { label: "idToken", type: "text" } },
      async authorize(credentials) {
        const idToken = credentials?.idToken?.trim();
        if (!idToken) return null;
        try {
          const r = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
          );
          if (!r.ok) return null;
          const p: any = await r.json();
          // audience must match one of our Google OAuth client IDs
          const allowed = [
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_IOS_CLIENT_ID,
            process.env.GOOGLE_ANDROID_CLIENT_ID,
          ].filter(Boolean);
          if (allowed.length > 0 && !allowed.includes(p.aud)) return null;
          if (p.email_verified !== true && p.email_verified !== "true") return null;
          if (!p.email) return null;
          return {
            id: p.sub,
            name: p.name || String(p.email).split("@")[0],
            email: p.email,
            image: p.picture || null,
          };
        } catch (e) {
          console.error("native-google authorize error:", e);
          return null;
        }
      },
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
    // Always use our own screen — never the default NextAuth signin page
    // (which exposes the raw idToken / email credential forms).
    signIn: "/",
    error: "/",
  },
};
