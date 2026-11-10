import React from "react";
import { RiskLevel, RouteStatus, SensorStatus } from "@/types/evora";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config: Record<
    RiskLevel,
    { label: string; variant: "safe" | "warning" | "critical" | "neutral" }
  > = {
    low: {
      label: "Low Risk",
      variant: "safe",
    },
    moderate: {
      label: "Moderate Risk",
      variant: "warning",
    },
    high: {
      label: "High Risk",
      variant: "warning",
    },
    critical: {
      label: "Critical Risk",
      variant: "critical",
    },
  };

  const item = config[level] ?? { label: String(level), variant: "neutral" as const };
  return (
    <Badge variant={item.variant} dot className={className}>
      {item.label}
    </Badge>
  );
}

interface RouteStatusBadgeProps {
  status: RouteStatus;
  className?: string;
}

export function RouteStatusBadge({ status, className }: RouteStatusBadgeProps) {
  const config: Record<
    RouteStatus,
    { label: string; variant: "safe" | "warning" | "critical" }
  > = {
    recommended: {
      label: "Recommended",
      variant: "safe",
    },
    alternative: {
      label: "Alternative",
      variant: "warning",
    },
    blocked: {
      label: "Blocked",
      variant: "critical",
    },
  };

  const item = config[status] ?? { label: String(status), variant: "warning" as const };
  return (
    <Badge variant={item.variant} dot className={className}>
      {item.label}
    </Badge>
  );
}

interface SensorStatusBadgeProps {
  status: SensorStatus;
  className?: string;
}

export function SensorStatusBadge({
  status,
  className,
}: SensorStatusBadgeProps) {
  const config: Record<
    SensorStatus,
    {
      label: string;
      variant: "safe" | "warning" | "critical" | "neutral";
    }
  > = {
    normal: {
      label: "Normal",
      variant: "safe",
    },
    warning: {
      label: "Warning",
      variant: "warning",
    },
    critical: {
      label: "Critical",
      variant: "critical",
    },
    offline: {
      label: "Offline",
      variant: "neutral",
    },
  };

  const item = config[status] ?? { label: String(status), variant: "neutral" as const };
  return (
    <Badge variant={item.variant} dot className={className}>
      {item.label}
    </Badge>
  );
}

export function DemoDataBadge({
  label = "Simulation Telemetry",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F7F4] text-[#52525B] border border-[#E2E2DE]",
        className
      )}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-[#71717A]"
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
