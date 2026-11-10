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
    default: "bg-[#18181B] text-white border-transparent",
    secondary: "bg-[#F1F1EE] text-[#18181B] border-[#E2E2DE]",
    outline: "bg-white text-[#18181B] border-[#E2E2DE]",
    safe: "bg-white text-[#18181B] border-[#E2E2DE]",
    warning: "bg-white text-[#18181B] border-[#E2E2DE]",
    critical: "bg-white text-[#18181B] border-[#E2E2DE]",
    neutral: "bg-[#F7F7F4] text-[#52525B] border-[#E2E2DE]",
  };

  const dotColors: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-white",
    secondary: "bg-[#52525B]",
    outline: "bg-[#52525B]",
    safe: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-[#C84B28]",
    neutral: "bg-zinc-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs font-medium leading-5 transition-colors",
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
