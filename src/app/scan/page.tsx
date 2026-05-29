"use client";
import { useRouter } from "next/navigation";

export default function ScanRedirect() {
  const router = useRouter();
  if (typeof window !== "undefined") router.push("/");
  return null;
}
