import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition",
          "focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60",
          variant === "primary"
            ? "bg-white text-brand hover:bg-white/90"
            : "bg-transparent text-white/90 hover:bg-white/10",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
