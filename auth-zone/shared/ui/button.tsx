import * as React from "react";

const variantClasses: Record<string, string> = {
  default: "",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl text-base font-medium transition-all duration-300 focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
