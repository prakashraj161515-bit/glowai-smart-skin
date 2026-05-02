"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Utensils, MessageCircle, User, Gem } from "lucide-react";
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
    { name: "Diet", href: "/diet", icon: Utensils },
    { name: "Premium", href: "/premium", icon: Gem, special: true },
    { name: "Chat", href: "/coach", icon: MessageCircle },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-50 max-w-[430px] mx-auto">
      <nav className="h-16 bg-white border border-[#EEF0FF] rounded-[24px] shadow-2xl shadow-purple-500/15 px-2 flex items-center justify-around pointer-events-auto overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="relative group flex flex-col items-center justify-center flex-1">
              <div className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-all duration-300",
                isActive ? "text-purple-600 scale-105" : "text-slate-300 hover:text-slate-400",
                item.special && !isPremium && "animate-bounce-subtle"
              )}>
                <item.icon 
                  size={item.special ? 24 : 20} 
                  className={cn(
                    isActive ? "stroke-[2.5px]" : "stroke-[2px]",
                    item.special && !isActive && "text-purple-500 opacity-60",
                    item.special && isActive && "text-purple-600"
                  )} 
                />
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-tighter transition-all",
                  isActive ? "opacity-100 text-purple-600" : "opacity-0"
                )}>
                  {item.name}
                </span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-1 bg-purple-600 rounded-full"
                />
              )}
              {item.special && !isPremium && (
                <div className="absolute -top-1 -right-0 w-2 h-2 bg-pink-500 rounded-full border border-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
