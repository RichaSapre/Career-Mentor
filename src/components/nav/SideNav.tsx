"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  LineChart, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { fakeAuth } from "@/lib/auth/fakeAuth";

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/market-analyzer", label: "Market Analyzer", icon: LineChart },
  { href: "/profile", label: "Profile", icon: User },
];

export function SideNav() {
  const path = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  function signOut() {
    fakeAuth.logout();
    router.push("/welcome");
  }

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-4 z-50">
        <div className="text-lg font-bold text-zinc-100">Career Mentor</div>
        <button 
          onClick={toggleMobileSidebar}
          className="p-2 text-zinc-400 hover:text-cyan-400"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar aside */}
      <aside 
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out border-r border-slate-800/50 bg-[#0F172A]/80 backdrop-blur-xl flex flex-col p-4",
          isCollapsed ? "md:w-20" : "md:w-64",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo / Toggle Button */}
        <div className={cn(
          "flex items-center mb-8",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500">Career Mentor</div>}
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex p-2 rounded-lg bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2">
          {items.map((it) => {
            const active = path?.startsWith(it.href);
            const Icon = it.icon;

            return (
              <Link
                key={it.href}
                href={it.href as any}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all group",
                  active
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent",
                  isCollapsed && "md:justify-center md:px-0"
                )}
                title={isCollapsed ? it.label : ""}
              >
                <Icon size={20} className={cn("shrink-0", active ? "text-cyan-400" : "text-zinc-600 group-hover:text-zinc-400")} />
                {!isCollapsed && <span>{it.label}</span>}
                <span className="md:hidden">{it.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Push Sign Out to bottom */}
        <div className="mt-auto pt-6">
          <button
            onClick={signOut}
            className={cn(
              "flex items-center gap-3 w-full rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15 transition",
              isCollapsed && "md:justify-center md:px-0"
            )}
            title={isCollapsed ? "Sign out" : ""}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
            <span className="md:hidden">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}