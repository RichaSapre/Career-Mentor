import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl bg-input-bg border border-input-border px-4 py-3 text-input-text outline-none",
          "placeholder:text-input-placeholder",
          "focus:ring-2 focus:ring-input-focus-ring focus:border-accent-primary",
          "transition-all",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
