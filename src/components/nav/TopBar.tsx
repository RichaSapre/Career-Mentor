"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";

export function TopBar({ title }: { title: string }) {
  const router = useRouter();
  const logout = useLogout();

  async function handleLogout() {
    try {
      await logout.mutateAsync();
    } finally {
      router.replace("/welcome");
    }
  }

  return (
    <header className="mx-auto flex max-w-md items-center justify-between px-5 py-4 bg-surface backdrop-blur-xl border-b border-border rounded-b-[2rem] shadow-card transition-all">
      <h1 className="text-lg font-black text-heading italic tracking-tight">{title}</h1>
      <Button
        variant="ghost"
        onClick={handleLogout}
        aria-label="Logout"
        className="px-3 py-2 text-faint hover:text-red-500 transition-colors"
        disabled={logout.isPending}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
