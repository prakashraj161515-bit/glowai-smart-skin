"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Home, BarChart2, MessageSquare, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Scan", href: "/scan", icon: Camera },
    { name: "Progress", href: "/progress", icon: BarChart2 },
    { name: "Coach", href: "/coach", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 h-16 glass-card px-4 flex items-center justify-between z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href} className="relative group">
            <div className={cn(
              "flex flex-col items-center justify-center transition-all duration-300",
              isActive ? "text-purple-400" : "text-slate-400 group-hover:text-slate-300"
            )}>
              <item.icon size={24} />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </div>
            {isActive && (
              <motion.div
                layoutId="nav-glow"
                className="absolute -inset-2 bg-purple-500/20 blur-lg rounded-full -z-10"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
