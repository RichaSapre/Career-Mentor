import * as React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-xl",
        "px-5 py-6",
        className
      )}
    >
      {children}
    </div>
  );
}
