import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-text-muted bg-input-bg px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-[#6b7280] focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
