import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
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
