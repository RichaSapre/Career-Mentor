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
  ChevronRight,
  Sparkles
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import { fakeAuth } from "@/lib/auth/fakeAuth";

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
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface backdrop-blur-xl border-b border-border flex items-center justify-between px-4 z-50">
        <div className="text-lg font-black text-heading italic">Career Mentor</div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={toggleMobileSidebar}
            className="p-2 text-muted hover:text-accent-primary"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-overlay backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out border-r border-border bg-surface backdrop-blur-xl flex flex-col p-4",
          isCollapsed ? "md:w-20" : "md:w-64",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Toggle Button for Desktop */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-surface items-center justify-center text-muted hover:text-accent-primary shadow-sm z-50 hover:scale-110 transition-all"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 mb-10 px-2 group cursor-pointer transition-all",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          onClick={() => router.push('/dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-heading to-muted tracking-tighter italic transition-all whitespace-nowrap">
              Career Mentor
            </h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {items.map((item) => {
            const isActive = path === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href as any);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative",
                  isActive
                    ? "bg-accent-primary text-white shadow-glow-primary"
                    : "text-muted hover:bg-surface-hover hover:text-heading",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : ""}
              >
                <item.icon className={cn("transition-transform duration-300 group-hover:scale-110 flex-shrink-0",
                  isCollapsed ? "w-6 h-6" : "w-5 h-5",
                  isActive ? "text-white" : "text-faint group-hover:text-accent-primary"
                )} />
                {!isCollapsed && <span className="font-black text-sm italic">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="mt-auto pt-6 border-t border-divider">
          <button
            onClick={signOut}
            className={cn(
              "flex items-center gap-3 w-full rounded-xl bg-surface-inset px-3 py-3 text-sm font-black italic hover:bg-surface-hover transition-all text-muted hover:text-heading",
              isCollapsed && "justify-center px-0"
            )}
            title={isCollapsed ? "Sign out" : ""}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}