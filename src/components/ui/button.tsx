import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "embossed"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "terracotta"
    | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
      default:
        "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 shadow-xs font-semibold",
      primary:
        "btn-primary text-white",
      embossed: "btn-embossed text-white font-semibold",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200/80 border border-slate-200 font-semibold",
      outline:
        "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-xs font-medium",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium",
      destructive:
        "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100/80 font-semibold",
      terracotta:
        "bg-rose-600 text-white hover:bg-rose-700 border border-rose-700 shadow-xs font-semibold",
      accent:
        "bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#C7D2FE] text-[#2563EB] font-semibold",
    };

    const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
      default: "h-9 px-3.5 py-2 text-xs font-medium rounded-xl",
      sm: "h-8 px-3 py-1.5 text-xs font-medium rounded-lg",
      lg: "h-10 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl",
      icon: "h-9 w-9 rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
