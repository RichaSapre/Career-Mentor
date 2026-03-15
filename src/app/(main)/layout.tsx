"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SideNav } from "@/components/nav/SideNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { tokenStore } from "@/lib/auth/tokenStore";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!tokenStore.getAccess()) {
      router.replace("/welcome");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="bg-gradient-soft min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-soft min-h-screen flex flex-col md:flex-row relative">
      <SideNav />
      
      {/* Intuitive Floating Theme Toggle (Top Right) */}
      <div className="fixed top-6 right-6 z-[60] hidden md:block">
        <ThemeToggle className="shadow-elevated scale-110" />
      </div>

      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8 overflow-y-auto w-full">
        <div className="w-full flex flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}