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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/15 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-3 py-3">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href as any}
              className={cn(
                "rounded-lg px-2 py-1 text-xs font-medium transition",
                active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"
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
