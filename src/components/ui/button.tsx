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
        "bg-[#0F172A] text-white hover:bg-[#1E293B] border border-[#0F172A] shadow-sm font-semibold",
      primary:
        "btn-primary text-white",
      embossed: "btn-embossed text-white font-semibold",
      secondary:
        "bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] border border-[#E2E8F0] font-semibold",
      outline:
        "bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-sm font-medium",
      ghost: "bg-transparent text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] font-medium",
      destructive:
        "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-semibold",
      terracotta:
        "bg-red-600 text-white hover:bg-red-700 border border-red-700 shadow-sm font-semibold",
      accent:
        "bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#C7D2FE] text-[#4B6BFB] font-semibold",
    };

    const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
      default: "h-9 px-3.5 py-2 text-xs font-medium rounded-xl",
      sm: "h-8 px-3 py-1.5 text-xs font-medium rounded-[10px]",
      lg: "h-10 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl",
      icon: "h-9 w-9 rounded-[10px]",
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
