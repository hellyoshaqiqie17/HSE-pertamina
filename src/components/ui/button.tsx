import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "embossed"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "terracotta";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
      default:
        "bg-[#18181B] text-white hover:bg-[#27272A] border border-[#18181B] shadow-xs",
      embossed: "btn-embossed text-white",
      secondary:
        "bg-[#F1F1EE] text-[#18181B] hover:bg-[#E6E5E0] border border-[#E2E2DE]",
      outline:
        "bg-white text-[#18181B] border border-[#E2E2DE] hover:bg-[#F7F7F4] hover:border-[#D4D4CE] shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
      ghost: "bg-transparent text-[#52525B] hover:bg-[#F1F1EE] hover:text-[#18181B]",
      destructive:
        "bg-white text-[#991B1B] border border-[#E2E2DE] hover:bg-[#FAF8F7] hover:border-[#D4D4CE]",
      terracotta:
        "bg-[#C84B28] text-white hover:bg-[#A93B1D] border border-[#B03E1F] shadow-xs",
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
