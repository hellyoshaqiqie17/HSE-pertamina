"use client";

import React, { useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  Ban,
  BatteryCharging,
  Radio,
  ZapOff,
} from "lucide-react";
import { EvacuationRoute } from "@/types/evora";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SignagePreview({
  routes,
  lastUpdated,
}: {
  routes: EvacuationRoute[];
  lastUpdated: string;
}) {
  const [backupPowerMode, setBackupPowerMode] = useState(false);
  const [selectedSignageRouteId, setSelectedSignageRouteId] = useState<
    string | "auto"
  >("auto");

  const recommendedRoute =
    routes.find((r) => r.status === "recommended") ?? null;
  const blockedRoutes = routes.filter((r) => r.status === "blocked");

  const activeSignageRoute =
    selectedSignageRouteId === "auto"
      ? recommendedRoute ?? routes[0]
      : routes.find((r) => r.id === selectedSignageRouteId) ??
        recommendedRoute ??
        routes[0];

  const isRecommended =
    activeSignageRoute?.status === "recommended" && recommendedRoute !== null;
  const isBlocked =
    activeSignageRoute?.status === "blocked" || recommendedRoute === null;

  const renderDirectionArrow = (
    dir?: EvacuationRoute["signageDirection"],
    blocked?: boolean
  ) => {
    if (blocked) {
      return <Ban className="w-7 h-7 text-[#DC2626]" aria-hidden="true" />;
    }
    switch (dir) {
      case "NORTH-WEST":
        return (
          <ArrowUpLeft className="w-7 h-7 text-[#0F172A]" aria-hidden="true" />
        );
      case "SOUTH-EAST":
        return (
          <ArrowDownRight
            className="w-7 h-7 text-[#0F172A]"
            aria-hidden="true"
          />
        );
      case "EAST":
        return (
          <ArrowRight className="w-7 h-7 text-[#0F172A]" aria-hidden="true" />
        );
      case "WEST":
      default:
        return (
          <ArrowLeft className="w-7 h-7 text-[#0F172A]" aria-hidden="true" />
        );
    }
  };

  return (
    <Card
      aria-labelledby="dynamic-signage-heading"
      className="p-5 sm:p-6 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#F1F5F9]">
        <div>
          <h3
            id="dynamic-signage-heading"
            className="text-sm font-semibold text-[#0F172A] flex items-center gap-2"
          >
            <Radio className="w-4 h-4 text-[#475569]" aria-hidden="true" />
            <span>Dynamic Field Evacuation Signage</span>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Telemetry preview of battery-backed field signage units across depot junctions.
          </p>
        </div>
        <Badge variant="neutral" dot>
          Field Node Preview
        </Badge>
      </div>

      {/* Signage Unit Selector & UPS Power Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="signage-node-select"
            className="text-xs font-medium text-[#475569]"
          >
            Node:
          </label>
          <select
            id="signage-node-select"
            value={selectedSignageRouteId}
            onChange={(e) => setSelectedSignageRouteId(e.target.value)}
            className="text-xs font-medium text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-1.5 h-9"
          >
            <option value="auto">
              Auto-Sync Active Guidance ({recommendedRoute?.signageNodeId ?? "All Nodes"})
            </option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.signageNodeId}: {r.shortCode} ({r.status})
              </option>
            ))}
          </select>
        </div>

        <Button
          type="button"
          variant={backupPowerMode ? "default" : "outline"}
          size="sm"
          onClick={() => setBackupPowerMode((prev) => !prev)}
          aria-pressed={backupPowerMode}
        >
          {backupPowerMode ? (
            <>
              <BatteryCharging className="w-3.5 h-3.5" aria-hidden="true" />
              <span>UPS Backup Active (98% Reserve)</span>
            </>
          ) : (
            <>
              <ZapOff className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />
              <span>Simulate Grid Power Cut</span>
            </>
          )}
        </Button>
      </div>

      {/* Minimalist Hardware Telemetry Frame */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E2E8F0] text-[11px] font-mono text-[#475569]">
          <span>
            Unit <strong className="text-[#0F172A]">{activeSignageRoute?.signageNodeId ?? "SGN-00"}</strong>{" "}
            · {activeSignageRoute?.signageLocation ?? "Gantry Junction"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BatteryCharging
              className="w-3.5 h-3.5 text-emerald-600"
              aria-hidden="true"
            />
            <span>
              {backupPowerMode
                ? "LiFePO4 UPS · 98% (6h)"
                : "AC Grid + Float Standby"}
            </span>
          </span>
        </div>

        {recommendedRoute === null ? (
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <Ban className="w-6 h-6 text-[#DC2626]" aria-hidden="true" />
            </div>
            <div>
              <div className="mb-1">
                <Badge variant="critical" dot>
                  All Corridors Exceed Threshold
                </Badge>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">
                Shelter in Place or Follow Site Warden Dispatch
              </p>
              <p className="text-xs text-[#475569] mt-0.5">
                Automated corridors currently exceed configured risk limits. Follow site muster protocol.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                {renderDirectionArrow(
                  activeSignageRoute?.signageDirection,
                  isBlocked
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge
                    variant={
                      isBlocked
                        ? "critical"
                        : isRecommended
                        ? "safe"
                        : "warning"
                    }
                    dot
                  >
                    {isBlocked
                      ? "Corridor Blocked · Do Not Enter"
                      : `Active Guidance · ${activeSignageRoute?.shortCode}`}
                  </Badge>
                  <span className="text-xs font-mono text-[#475569]">
                    Vector: {activeSignageRoute?.signageDirection}
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#0F172A]">
                  {isBlocked
                    ? `Redirect to ${recommendedRoute.name} (${recommendedRoute.destinationName})`
                    : `Proceed to ${activeSignageRoute?.destinationName}`}
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {isBlocked
                    ? `Threshold exceeded on ${activeSignageRoute?.shortCode}. Follow directional vector toward ${recommendedRoute.destinationName} (${recommendedRoute.distanceMeters} m).`
                    : `${activeSignageRoute?.corridorDescription} (${activeSignageRoute?.distanceMeters} m · est. ${activeSignageRoute?.estimatedTimeSeconds}s).`}
                </p>
              </div>
            </div>

            <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#F1F5F9]">
              <div className="text-[11px] text-[#64748B]">
                Composite Risk
              </div>
              <div className="text-lg font-mono font-bold tabular-nums text-[#0F172A]">
                {activeSignageRoute?.riskScore}
                <span className="text-xs font-normal text-[#64748B]">/100</span>
              </div>
              <div className="text-[11px] font-mono text-[#64748B]">
                Sync {lastUpdated}
              </div>
            </div>
          </div>
        )}

        {blockedRoutes.length > 0 && (
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" aria-hidden="true" />
              <span>
                Active interlock on <strong className="text-[#0F172A]">{blockedRoutes.map((b) => b.shortCode).join(", ")}</strong> (No Entry barrier active)
              </span>
            </span>
            <span className="font-mono text-[11px] text-[#64748B]">
              Latency: 280 ms
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
