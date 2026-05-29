"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const TABS = [
  { href:"/",        icon:"🏠", label:"Home"    },
  { href:"/store",   icon:"🧴", label:"Shelf"   },
  { href:"/",        icon:"🔬", label:"Scan",   special:true },
  { href:"/routine", icon:"📋", label:"Routine" },
  { href:"/profile", icon:"👤", label:"You"     },
];

export function BottomNav() {
  const { status } = useSession();
  const pathname   = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const demo = localStorage.getItem("velmora_auth_status")==="authenticated";
    setShow(status==="authenticated" || demo);
  }, [status, pathname]);

  if (!show) return null;
  if (pathname==="/coach") return null;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-3 pb-5 pointer-events-none z-50"
      style={{background:"linear-gradient(to top, #FAF8F6 60%, transparent)"}}>
      <nav className="h-[62px] rounded-[26px] px-1 flex items-center justify-around pointer-events-auto"
        style={{
          background:       "rgba(255,255,255,0.97)",
          backdropFilter:   "blur(20px) saturate(200%)",
          WebkitBackdropFilter:"blur(20px) saturate(200%)",
          border:           "1px solid rgba(60,30,20,0.08)",
          boxShadow:        "0 6px 24px rgba(60,30,20,0.12)",
        }}>
        {TABS.map((tab, i) => {
          const isActive = pathname===tab.href && !tab.special;
          if (tab.special) {
            return (
              <Link key={i} href={tab.href} className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 no-underline">
                <div className="w-[46px] h-[46px] rounded-[15px] flex items-center justify-center text-[22px] -mt-5 border-[2.5px] border-white"
                  style={{
                    background:  "#F0886A",
                    boxShadow:   "0 6px 16px rgba(240,136,106,0.45)",
                  }}>🔬</div>
                <span className="text-[10px] font-semibold mt-0.5" style={{color:"rgba(44,31,26,0.33)"}}>{tab.label}</span>
              </Link>
            );
          }
          return (
            <Link key={i} href={tab.href} className="flex flex-col items-center justify-center flex-1 h-full gap-[3px] no-underline relative">
              <div className={`flex items-center justify-center w-[34px] h-[26px] rounded-[9px] transition-all`}
                style={{background: isActive?"rgba(240,136,106,0.12)":"transparent"}}>
                <span className="text-[20px]" style={{opacity: isActive?1:0.4}}>{tab.icon}</span>
              </div>
              <span className="text-[10px] transition-all"
                style={{
                  color:      isActive?"#F0886A":"rgba(44,31,26,0.33)",
                  fontWeight: isActive?700:500,
                }}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full" style={{background:"#F0886A"}}/>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
