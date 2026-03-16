"use client";

import { useState, useRef, MouseEvent } from "react";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { Sparkles, ArrowRight, UserPlus, Compass } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function WelcomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-gradient-soft min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden relative"
    >
      <div className="fixed top-6 right-6 z-[60]">
        <ThemeToggle className="shadow-elevated scale-110" />
      </div>
      {/* Global Background Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, ${isHovered ? '0.04' : '0'}), transparent 70%)`
        }}
      />

      {/* Bento Grid Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">

        {/* Main Hero Card */}
        <div className="md:col-span-12 lg:col-span-8 flex flex-col items-start justify-center overflow-hidden rounded-[2.5rem] bg-surface border border-border backdrop-blur-3xl shadow-card p-8 md:p-14 relative group transition-all duration-500 hover:border-border-hover min-h-[400px] gemini-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/[0.03] to-transparent pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-72 h-72 bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 mb-8 flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-inset border border-border shadow-lg transition-transform duration-500 hover:scale-110">
            <Compass className="w-10 h-10 text-accent-primary" strokeWidth={1} />
            <div className="absolute top-2 right-2 animate-pulse">
              <Sparkles className="w-5 h-5 text-accent-secondary" />
            </div>
          </div>

          <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] mb-6`}>
            Career Mentor
          </h1>
          <p className="text-lg text-muted max-w-lg font-medium leading-relaxed italic">
            Unlock your potential. Advanced AI-driven career recommendations and real-time market simulation tailored to your unique trajectory.
          </p>
        </div>

        {/* Login Card */}
        <div className="md:col-span-6 lg:col-span-4 flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-surface border border-border backdrop-blur-3xl shadow-card p-8 relative group transition-all hover:bg-surface-hover hover:border-border-hover gemini-glow">
          <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-badge-info-bg text-badge-info-text border border-badge-info-border">
                <ArrowRight className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-heading italic">Welcome Back</h2>
            </div>
            <p className="text-muted mb-8 font-medium">Access your personalized dashboard and continue your journey.</p>
          </div>

          <Link
            href="/login"
            className="relative z-10 w-full flex items-center justify-center gap-2 rounded-2xl bg-btn-primary-bg text-btn-primary-text py-4 font-bold transition-all hover:bg-btn-primary-hover hover:scale-[1.02] shadow-glow-primary hover:shadow-[0_0_30px_var(--btn-primary-hover)]"
          >
            Sign In
          </Link>
        </div>

        {/* Register Card */}
        <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-surface border border-border backdrop-blur-3xl shadow-card p-8 relative group transition-all hover:bg-surface-hover hover:border-border-hover gemini-glow">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-badge-success-bg text-badge-success-text border border-badge-success-border">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-heading italic">New Here?</h2>
            </div>
            <p className="text-muted mb-8 font-medium">Build your profile and let our AI map out your optimal career path.</p>
          </div>

          <Link
            href="/signup"
            className="relative z-10 w-full flex items-center justify-center gap-2 rounded-2xl bg-btn-secondary-bg border border-btn-secondary-border py-4 font-bold text-btn-secondary-text transition-all hover:bg-btn-secondary-hover hover:border-border-hover hover:scale-[1.02] shadow-sm"
          >
            Create Account
          </Link>
        </div>

        {/* Guest Explorer Card */}
        <div className="md:col-span-12 lg:col-span-7 flex flex-col sm:flex-row items-center justify-between overflow-hidden rounded-[2.5rem] bg-surface border border-border backdrop-blur-3xl shadow-card p-8 relative group transition-all hover:border-border-hover gemini-glow">
          <div className="relative z-10 flex-1 mb-6 sm:mb-0">
            <h3 className="text-xl font-bold text-heading mb-2 italic">Public Market Analysis</h3>
            <p className="text-sm text-muted max-w-sm font-medium italic">Explore live market trends and skill demand without creating an account.</p>
          </div>

          <Link
            href="/market"
            className="relative z-10 w-full sm:w-auto px-6 py-4 rounded-xl bg-zinc-900 dark:bg-zinc-900 border border-border text-zinc-300 font-bold hover:text-accent-primary hover:border-border-hover transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Compass className="w-4 h-4" />
            Explore Trends
          </Link>
        </div>
      </div>


    </main>
  );
}