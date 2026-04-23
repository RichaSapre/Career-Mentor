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
        "rounded-2xl border border-border bg-surface backdrop-blur-xl shadow-card transition-all duration-300 gemini-glow",
        "px-5 py-6 sm:px-6 sm:py-7 relative",
        className
      )}
    >
      {children}
    </div>
  );
}
