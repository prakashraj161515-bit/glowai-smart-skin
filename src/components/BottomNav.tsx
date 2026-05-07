"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const premium = localStorage.getItem("velmora_is_premium") === "true";
    setIsPremium(premium);
  }, [pathname]);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Routine", href: "/routine", icon: Calendar },
    { name: "Cart", href: "/cart", icon: ShoppingBag },
    { name: "Profile", href: "/profile", icon: User },
  ];

  if (pathname === "/coach") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 px-8 pb-8 pt-3 bg-gradient-to-t from-[#FDF5F2] via-[#FDF5F2]/90 to-transparent pointer-events-none z-50 max-w-[430px] mx-auto">
      <nav className="h-20 bg-white border border-[#F3EAE8] rounded-[32px] shadow-2xl shadow-orange-500/10 px-4 flex items-center justify-around pointer-events-auto overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="relative group flex flex-col items-center justify-center flex-1">
              <div className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isActive ? "text-[#F88E7D] scale-110" : "text-slate-300 hover:text-slate-400"
              )}>
                <item.icon 
                  size={24} 
                  className={cn(
                    isActive ? "stroke-[2.5px] fill-[#F88E7D]/10" : "stroke-[2px]"
                  )} 
                />
              </div>
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-2 w-1.5 h-1.5 bg-[#F88E7D] rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
