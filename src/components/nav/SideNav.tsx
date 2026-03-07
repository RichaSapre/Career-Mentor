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
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="text-lg font-bold">Career Mentor</div>
        <button 
          onClick={toggleMobileSidebar}
          className="p-2 text-white/70 hover:text-white"
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
          "fixed md:sticky top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out border-r border-white/10 bg-white/5 backdrop-blur-xl flex flex-col p-4",
          isCollapsed ? "md:w-20" : "md:w-64",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo / Toggle Button */}
        <div className={cn(
          "flex items-center mb-8",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && <div className="text-lg font-bold">Career Mentor</div>}
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
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
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10",
                  isCollapsed && "md:justify-center md:px-0"
                )}
                title={isCollapsed ? it.label : ""}
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && <span>{it.label}</span>}
                {/* Always show text on mobile since it's never 'collapsed' there */}
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