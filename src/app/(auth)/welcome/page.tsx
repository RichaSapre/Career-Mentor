"use client";

import { useState, useRef, MouseEvent } from "react";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { Sparkles, ArrowRight, UserPlus, Compass } from "lucide-react";

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
      {/* Global Background Spotlight */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.05), transparent 70%)`
        }}
      />
      
      {/* Bento Grid Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
        
        {/* Main Hero Card */}
        <div className="md:col-span-12 lg:col-span-8 flex flex-col items-start justify-center overflow-hidden rounded-[2.5rem] bg-[#0F172A]/40 border border-slate-800/50 backdrop-blur-3xl shadow-2xl p-8 md:p-14 relative group transition-all duration-500 hover:border-cyan-500/30 min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 mb-8 flex items-center justify-center w-20 h-20 rounded-2xl bg-white/[0.05] border border-white/10 shadow-3xl transition-transform duration-500 hover:scale-110">
            <Compass className="w-10 h-10 text-cyan-400" strokeWidth={1} />
            <div className="absolute top-2 right-2 animate-pulse">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-zinc-100 to-zinc-500 mb-6`}>
            Career Mentor
          </h1>
          <p className="text-lg text-zinc-400 max-w-lg font-light leading-relaxed">
            Unlock your potential. Advanced AI-driven career recommendations and real-time market simulation tailored to your unique trajectory.
          </p>
        </div>

        {/* Login Card */}
        <div className="md:col-span-6 lg:col-span-4 flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-[#0F172A]/40 border border-slate-800/50 backdrop-blur-3xl shadow-xl p-8 relative group transition-all hover:bg-[#0F172A]/60 hover:border-cyan-500/20">
          <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ArrowRight className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-100">Welcome Back</h2>
            </div>
            <p className="text-zinc-500 mb-8">Access your personalized dashboard and continue your journey.</p>
          </div>
          
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 text-white py-4 font-bold transition-all hover:bg-cyan-500 hover:scale-[1.02] shadow-xl shadow-cyan-900/20"
          >
            Sign In
          </Link>
        </div>

        {/* Register Card */}
        <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-[#0F172A]/40 border border-slate-800/50 backdrop-blur-3xl shadow-xl p-8 relative group transition-all hover:bg-[#0F172A]/60 hover:border-emerald-500/20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-100">New Here?</h2>
            </div>
            <p className="text-zinc-500 mb-8">Build your profile and let our AI map out your optimal career path.</p>
          </div>
          
          <Link
            href="/signup"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 py-4 font-bold text-zinc-200 transition-all hover:bg-white/10 hover:border-emerald-500/30 hover:scale-[1.02]"
          >
            Create Account
          </Link>
        </div>

        {/* Guest Explorer Card */}
        <div className="md:col-span-12 lg:col-span-7 flex flex-col sm:flex-row items-center justify-between overflow-hidden rounded-[2.5rem] bg-[#0F172A]/40 border border-slate-800/50 backdrop-blur-3xl shadow-xl p-8 relative group transition-all hover:border-white/20">
          <div className="flex-1 mb-6 sm:mb-0">
            <h3 className="text-xl font-bold text-zinc-200 mb-2">Public Market Analysis</h3>
            <p className="text-sm text-zinc-500 max-w-sm">Explore live market trends and skill demand without creating an account.</p>
          </div>
          
          <Link 
            href="/market" 
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 font-medium hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Explore Trends
          </Link>
        </div>

      </div>


    </main>
  );
}