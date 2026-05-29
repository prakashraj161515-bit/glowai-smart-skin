"use client";
import { useRouter } from "next/navigation";
import { TabBar } from "./ui";

export default function AppTabBar({ active }: { active: string }) {
  const router = useRouter();
  const go = (id: string) => {
    if (id === "home") router.push("/");
    else if (id === "scan") router.push("/?scan=1");
    else if (id === "routine") router.push("/routine");
    else if (id === "products") router.push("/store");
    else if (id === "profile") router.push("/profile");
  };
  return <TabBar active={active} onChange={go} />;
}
