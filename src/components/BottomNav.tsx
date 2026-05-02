"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Lightbulb, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Diet", href: "/diet", icon: History },
    { name: "Chat", href: "/coach", icon: Lightbulb },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-50 max-w-[430px] mx-auto">
      <nav className="h-16 bg-white border border-[#EEF0FF] rounded-[22px] shadow-xl shadow-purple-500/10 px-6 flex items-center justify-around pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="relative group flex flex-col items-center justify-center">
              <div className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-all duration-300",
                isActive ? "text-purple-600 scale-110" : "text-slate-300 hover:text-slate-400"
              )}>
                <item.icon size={22} className={cn(isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest transition-all",
                  isActive ? "opacity-100 text-purple-600" : "opacity-0"
                )}>
                  {item.name}
                </span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-1 bg-purple-600 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
