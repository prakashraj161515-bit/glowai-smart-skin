import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const providers = [];

// Only add Google if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Always add a demo credentials provider as fallback
providers.push(
  CredentialsProvider({
    name: "Demo",
    credentials: {
      name: { label: "Name", type: "text" },
    },
    async authorize(credentials) {
      if (credentials?.name) {
        return {
          id: "demo-" + Date.now(),
          name: credentials.name,
          email: credentials.name.toLowerCase().replace(/\s/g, "") + "@velmora.demo",
          image: null,
        };
      }
      return null;
    },
  })
);

const handler = NextAuth({
  providers,
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "velmora-fallback-secret-key-2024",
  pages: {
    error: "/", // Redirect errors back to home instead of /api/auth/error
  },
});

export { handler as GET, handler as POST };
