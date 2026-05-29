import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300","400","500","600","700","800"],
});

export const metadata: Metadata = {
  title: "GlowAI – Smart Skin Analysis",
  description: "AI-powered personalized skin analysis and coaching app.",
  themeColor: "#FAF8F6",
  icons: {
    icon: "/logo.png?v=6",
    apple: "/logo.png?v=6",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${dmSans.variable} bg-[#FAF8F6]`} style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen items-center overflow-x-hidden">
            <div className="w-full max-w-[430px] min-h-screen bg-[#FAF8F6] relative"
              style={{ boxShadow: "0 0 80px rgba(240,136,106,0.07)" }}>
              <main>{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

