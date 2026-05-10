"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut as nextSignOut } from "next-auth/react";
import { 
  User, Shield, Bell, LogOut, ChevronRight, Settings, 
  Smartphone, Mail, Clock, Camera, Sparkles,
  Edit2, Gem, BellRing, Target
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [country, setCountry] = useState("India");
  
  const [userName, setUserName] = useState("User");
  const [profilePic, setProfilePic] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const premium = localStorage.getItem("velmora_is_premium") === "true";
    const savedGender = localStorage.getItem("velmora_user_gender") as "male" | "female";
    const savedCountry = localStorage.getItem("velmora_user_country");
    
    if (savedGender) setGender(savedGender);
    if (savedCountry) setCountry(savedCountry);
    setIsPremium(premium);

    if (status === "authenticated" && session?.user) {
      setUserName(session.user.name || "User");
      setProfilePic(session.user.image || "");
    }
    
    setIsLoaded(true);
  }, [status, session]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("velmora_user_name", userName);
      localStorage.setItem("velmora_user_pic", profilePic);
      localStorage.setItem("velmora_user_gender", gender);
      localStorage.setItem("velmora_user_country", country);
    }
  }, [isLoaded, userName, profilePic, gender, country]);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [skinType, setSkinType] = useState("Combination");

        <button onClick={() => { nextSignOut(); localStorage.clear(); }} className="w-full h-16 card flex items-center justify-center gap-3 text-red-400 font-bold text-[15px] hover:bg-red-50 border-red-50 transition-colors mt-8">
          <LogOut size={20} /> Log Out Account
        </button>


        <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest pb-10">Velmora Premium • Build v1.4.0</p>
      </div>
    </div>
  );
}
