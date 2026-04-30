import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "glowai-official – Skin & Face Coach",
  description: "AI-powered personalized skin and face coaching app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-background min-h-screen pb-20`}>
        <main className="max-w-lg mx-auto px-4 pt-8">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
