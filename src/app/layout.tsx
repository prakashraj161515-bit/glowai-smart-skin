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
  title: "Cream : AI Skin Care & Scanner",
  description: "AI-powered personalized skin analysis, routine & product scanner.",
  themeColor: "#FAF8F6",
  icons: {
    icon: [
      { url: "/favicon-32.png?v=12", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png?v=12", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=12", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png?v=12",
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
      <body className={`${dmSans.variable}`} style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <AuthProvider>
          <div className="app-bg">
            <div className="app-frame">
              <main>{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

