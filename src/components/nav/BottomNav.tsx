"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/jobs", label: "Jobs" },
  { href: "/market-analyzer", label: "Market Analyzer" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface backdrop-blur-2xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-3 py-4">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href as any}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-black italic tracking-wider transition-all duration-300",
                active
                  ? "bg-accent-primary text-btn-primary-text shadow-glow-primary scale-105"
                  : "text-muted hover:bg-surface-hover hover:text-accent-primary"
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
