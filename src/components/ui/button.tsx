import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-input-focus-ring disabled:opacity-60";

    const variants: Record<string, string> = {
      primary:
        "bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover shadow-glow-primary hover:shadow-[0_0_30px_var(--btn-primary-hover)]",
      secondary:
        "bg-btn-secondary-bg text-btn-secondary-text border border-btn-secondary-border hover:bg-btn-secondary-hover",
      ghost:
        "bg-btn-ghost-bg text-btn-ghost-text hover:bg-btn-ghost-hover",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
