"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userName, setUserName]     = useState("Maya");
  const [userPic,  setUserPic]      = useState("");
  const [isPremium,setIsPremium]    = useState(false);
  const [scanCount,setScanCount]    = useState(0);
  const [streak,   setStreak]       = useState(12);
  const [skinScore,setSkinScore]    = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("velmora_user_name");
    const pic  = localStorage.getItem("velmora_user_pic");
    const prem = localStorage.getItem("velmora_is_premium")==="true";
    const hist = localStorage.getItem("velmora_scan_history");
    const scan = localStorage.getItem("velmora_analysis");
    if (name) setUserName(name);
    if (pic)  setUserPic(pic);
    setIsPremium(prem);
    if (hist) { try { setScanCount(JSON.parse(hist).length); } catch {} }
    if (scan) { try { setSkinScore(JSON.parse(scan).score || 0); } catch {} }
    if (status==="authenticated" && session?.user?.name) setUserName(session.user.name);
    if (status==="authenticated" && session?.user?.image) setUserPic(session.user.image || "");
  }, [status, session]);

  const ROWS = [
    { icon:"📈", label:"My Progress",          href:"/progress" },
    { icon:"📋", label:"My Routine",            href:"/routine"  },
    { icon:"📓", label:"Skin Diary",            href:"/diary"    },
    { icon:"🔔", label:"Notifications",         href:"#"         },
    { icon:"💳", label:"Subscription & Billing",href:"/premium"  },
    { icon:"❓", label:"Help & FAQ",            href:"#"         },
  ];

  const handleSignOut = async () => {
    localStorage.removeItem("velmora_auth_status");
    await signOut({ callbackUrl:"/" });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6] pb-32 px-5 pt-[108px]">

      {/* ── HEADER ── */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-[72px] h-[72px] rounded-full flex-shrink-0 overflow-hidden"
          style={{background:"#F0886A"}}>
          {userPic
            ? <img src={userPic} className="w-full h-full object-cover" alt="User"/>
            : <span className="w-full h-full flex items-center justify-center text-[30px]"
                style={{fontFamily:"'Instrument Serif',Georgia,serif", color:"#241712"}}>
                {userName?.[0]?.toUpperCase() || "M"}
              </span>
          }
        </div>
        <div className="flex-1">
          {isEditingName ? (
            <input autoFocus value={userName}
              onChange={e=>setUserName(e.target.value)}
              onBlur={()=>{setIsEditingName(false);localStorage.setItem("velmora_user_name",userName);}}
              onKeyDown={e=>{if(e.key==="Enter"){setIsEditingName(false);localStorage.setItem("velmora_user_name",userName);}}}
              className="text-[28px] text-[#2C1F1A] bg-transparent border-b border-[#F0886A] outline-none w-full"
              style={{fontFamily:"'Instrument Serif',Georgia,serif"}}/>
          ) : (
            <h1 className="text-[28px] text-[#2C1F1A] leading-none cursor-pointer"
              style={{fontFamily:"'Instrument Serif',Georgia,serif"}}
              onClick={()=>setIsEditingName(true)}>{userName}</h1>
          )}
          <div className="flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-[8px] self-start w-fit"
            style={{background:"rgba(240,136,106,0.12)"}}>
            <span className="text-[11px]">✦</span>
            <span className="text-[12.5px] font-bold text-[#C44E28]">{isPremium?"Pro Member":"Free Plan"}</span>
          </div>
        </div>
        <button onClick={()=>setIsEditingName(true)}
          className="w-[38px] h-[38px] rounded-[12px] bg-white border flex items-center justify-center cursor-pointer"
          style={{borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 4px 12px rgba(60,30,20,0.06)"}}>✏️</button>
      </div>

      {/* ── STATS ── */}
      <div className="rounded-[22px] bg-white border mb-[18px] flex"
        style={{borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 4px 20px rgba(60,30,20,0.08)"}}>
        {[[`${streak}`,"Day streak"],[`${scanCount||18}`,"Total scans"],[`${skinScore||74}`,"Skin score"]].map(([v,l],i)=>(
          <div key={i} className="flex-1 py-4 text-center" style={{borderLeft:i>0?"1px solid rgba(60,30,20,0.08)":"none"}}>
            <p className="text-[26px] font-semibold leading-none text-[#2C1F1A]" style={{fontFamily:"'Space Grotesk',monospace"}}>{v}</p>
            <p className="text-[12px] text-[rgba(44,31,26,0.56)] mt-1">{l}</p>
          </div>
        ))}
      </div>

      {/* ── MENU ROWS ── */}
      <div className="rounded-[22px] bg-white border overflow-hidden mb-3.5"
        style={{borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 4px 20px rgba(60,30,20,0.08)"}}>
        {ROWS.map((row,i) => (
          <Link key={i} href={row.href}
            className="flex items-center gap-3 px-3 py-3.5 no-underline" style={{borderTop:i>0?"1px solid rgba(60,30,20,0.08)":"none"}}>
            <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[16px]"
              style={{background:"#F5F1EE"}}>{row.icon}</div>
            <span className="flex-1 text-[15.5px] text-[#2C1F1A]">{row.label}</span>
            <span className="text-[rgba(44,31,26,0.33)] text-[18px]">›</span>
          </Link>
        ))}
      </div>

      {/* ── SIGN OUT ── */}
      <button onClick={handleSignOut}
        className="w-full h-[52px] rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2.5 cursor-pointer border mb-2.5"
        style={{background:"rgba(224,104,92,0.08)", borderColor:"rgba(224,104,92,0.25)", color:"#E0685C"}}>
        ↪ Sign Out
      </button>
      <p className="text-center text-[13.5px] text-[rgba(44,31,26,0.33)] cursor-pointer">Switch Account</p>
    </div>
  );
}
