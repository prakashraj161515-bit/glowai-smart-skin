import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Velmora – Smart Skin Analysis",
  description: "AI-powered personalized skin analysis and coaching app.",
  themeColor: "#FDF5F2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-outfit bg-[#FDF5F2]`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen items-center overflow-x-hidden">
            <div className="w-full max-w-[430px] min-h-screen bg-[#FDF5F2] relative shadow-[0_0_100px_rgba(248,142,125,0.1)]">
              <main>{children}</main>
              <BottomNav />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

