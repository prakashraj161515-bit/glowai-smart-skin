"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Calendar, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { status } = useSession();
  const pathname = usePathname();
  const [isPremium, setIsPremium] = useState(false);
  const [isDemoAuth, setIsDemoAuth] = useState(false);

  useEffect(() => {
    const premium = localStorage.getItem("velmora_is_premium") === "true";
    setIsPremium(premium);
    
    const demoAuth = localStorage.getItem("velmora_auth_status") === "authenticated";
    setIsDemoAuth(demoAuth);
  }, [pathname]);

  if (status !== "authenticated" && !isDemoAuth) return null;
  if (pathname === "/coach") return null;

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Routine", href: "/routine", icon: Calendar },
    { name: "Store", href: "/store", icon: ShoppingBag },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-3 pb-5 pointer-events-none z-50"
      style={{ background: "linear-gradient(to top, #FAF8F6 62%, transparent)" }}>
      <nav className="h-[62px] rounded-[26px] px-1 flex items-center justify-around pointer-events-auto overflow-hidden"
        style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)", border: "1px solid rgba(60,30,20,0.08)", boxShadow: "0 6px 24px rgba(60,30,20,0.12)" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-[3px]">
              <div className={cn(
                "flex items-center justify-center w-[34px] h-[26px] rounded-[9px] transition-all duration-200",
                isActive ? "bg-[rgba(240,136,106,0.12)]" : ""
              )}>
                <item.icon size={22}
                  style={{ color: isActive ? "#F0886A" : "rgba(44,31,26,0.33)", strokeWidth: isActive ? 2.2 : 1.7 }} />
              </div>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? "#F0886A" : "rgba(44,31,26,0.33)" }}>
                {item.name}
              </span>
              {isActive && (
                <motion.div layoutId="nav-dot"
                  className="absolute bottom-0 w-1 h-1 rounded-full" style={{ backgroundColor: "#F0886A" }} />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
