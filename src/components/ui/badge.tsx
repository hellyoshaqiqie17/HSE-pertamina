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
    default: "bg-slate-900 text-white border-slate-900 shadow-xs",
    secondary: "bg-slate-100 text-slate-800 border-slate-200",
    outline: "bg-white text-slate-800 border-slate-200 shadow-xs",
    safe: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
    warning: "bg-amber-50 text-amber-900 border-amber-200/90",
    critical: "bg-rose-50 text-rose-900 border-rose-200/90",
    neutral: "bg-slate-50 text-slate-600 border-slate-200",
  };

  const dotColors: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-white",
    secondary: "bg-slate-500",
    outline: "bg-slate-400",
    safe: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-rose-500",
    neutral: "bg-slate-400",
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
