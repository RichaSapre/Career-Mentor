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
        "rounded-3xl border border-border bg-surface backdrop-blur-2xl shadow-card transition-all duration-300 gemini-glow",
        "px-6 py-8 relative",
        className
      )}
    >
      {children}
    </div>
  );
}
