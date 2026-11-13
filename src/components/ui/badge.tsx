import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "safe"
    | "warning"
    | "critical"
    | "neutral";
  dot?: boolean;
}

function Badge({
  className,
  variant = "outline",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-[#0F172A] text-white border-[#0F172A]",
    secondary: "bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]",
    outline: "bg-white text-[#0F172A] border-[#E2E8F0]",
    safe: "bg-[#ECFDF5] text-emerald-800 border-emerald-200",
    warning: "bg-[#FFFBEB] text-amber-900 border-amber-200",
    critical: "bg-[#FEF2F2] text-red-900 border-red-200",
    neutral: "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]",
  };

  const dotColors: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-white",
    secondary: "bg-[#64748B]",
    outline: "bg-[#94A3B8]",
    safe: "bg-[#10B981]",
    warning: "bg-[#F59E0B]",
    critical: "bg-[#EF4444]",
    neutral: "bg-[#94A3B8]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5 transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
