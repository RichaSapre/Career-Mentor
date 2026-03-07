import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl bg-white/15 px-4 py-3 text-white outline-none",
          "placeholder:text-white/50",
          "focus:ring-2 focus:ring-white/30",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
