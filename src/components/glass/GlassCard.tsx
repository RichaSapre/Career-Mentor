import * as React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl border border-slate-800/50 bg-[#0F172A]/40 backdrop-blur-xl shadow-2xl",
        "px-6 py-8",
        className
      )}
    >
      {children}
    </div>
  );
}
