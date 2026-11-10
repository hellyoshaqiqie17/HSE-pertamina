"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ManifoldArmCard({
  status = "Critical",
  lelValue = 44.2,
  lastScan = "09:51 WIB",
  selected = false,
  onSelect,
}: {
  status?: "Critical" | "Risk" | "Safe";
  lelValue?: number;
  lastScan?: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const variant =
    status === "Critical"
      ? "critical"
      : status === "Risk"
      ? "warning"
      : "safe";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      aria-label={`Inspect Storage Tank T-102 and Manifold PIPE-01, status ${status}, reading ${lelValue}% LEL`}
      className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03),0_1px_6px_rgba(0,0,0,0.04)] ${
        selected
          ? "border-[#18181B] ring-1 ring-[#18181B]/10"
          : "border-[#E2E2DE] hover:border-[#D4D4CE]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#18181B]">
            Tank T-102 &amp; Manifold
          </h3>
          <p className="text-[11px] text-[#68686F] font-mono mt-0.5">
            IoT Telemetry : {lastScan}
          </p>
        </div>
        <span className="p-1 rounded-lg text-[#68686F] hover:bg-[#F7F7F4] hover:text-[#18181B]">
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>

      {/* EVORA Domain Vector: Cylindrical Fuel Tank T-102 + Manifold Flange Leak + IoT Sensors */}
      <div className="my-2 flex items-center justify-center">
        <svg
          viewBox="0 0 180 135"
          className="w-full h-28"
          aria-hidden="true"
        >
          {/* Containment Bund Base */}
          <rect
            x="16"
            y="108"
            width="148"
            height="12"
            rx="3"
            fill="#D4D2CC"
            stroke="#8A8880"
            strokeWidth="1.2"
          />
          {/* Floating-Roof Fuel Tank T-102 */}
          <rect
            x="26"
            y="30"
            width="68"
            height="78"
            fill="#E5E3DD"
            stroke="#71717A"
            strokeWidth="1.4"
          />
          <rect
            x="27"
            y="31"
            width="66"
            height="7"
            fill="#C84B28"
            opacity="0.85"
          />
          <line x1="26" y1="56" x2="94" y2="56" stroke="#C4C0B6" strokeWidth="1" />
          <line x1="26" y1="82" x2="94" y2="82" stroke="#C4C0B6" strokeWidth="1" />
          <text
            x="60"
            y="72"
            textAnchor="middle"
            fill="#18181B"
            fontSize="9.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            T-102
          </text>

          {/* Manifold Transfer Header & Motorized Valve */}
          <rect
            x="94"
            y="78"
            width="56"
            height="8"
            fill="#A8A49C"
            stroke="#52525B"
            strokeWidth="1.2"
          />
          <rect
            x="118"
            y="66"
            width="14"
            height="42"
            fill="#D4D2CC"
            stroke="#52525B"
            strokeWidth="1.2"
          />
          <circle
            cx="125"
            cy="60"
            r="6"
            fill="#FFFFFF"
            stroke="#C84B28"
            strokeWidth="1.8"
          />

          {/* Multi-Hazard Vapor Plume Contour */}
          <circle
            cx="125"
            cy="78"
            r="26"
            fill="rgba(200, 75, 40, 0.16)"
            stroke="#C84B28"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <circle
            cx="125"
            cy="78"
            r="4.5"
            fill="#C84B28"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-[11px] font-mono text-[#68686F]">
          GS-204 ({lelValue}% LEL)
        </span>
        <Badge variant={variant} dot>
          {status}
        </Badge>
      </div>
    </div>
  );
}

export function DynamicSignageArmCard({
  routeCode = "ROUTE A",
  status = "Risk",
  lastScan = "09:51 WIB",
  selected = false,
  onSelect,
}: {
  routeCode?: string;
  status?: "Safe" | "Risk" | "Critical";
  lastScan?: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const variant =
    status === "Critical"
      ? "critical"
      : status === "Risk"
      ? "warning"
      : "safe";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      aria-label={`Inspect Tanker Loading Gantry LB-01 and Multi-Agent Egress, active route ${routeCode}, status ${status}`}
      className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03),0_1px_6px_rgba(0,0,0,0.04)] ${
        selected
          ? "border-[#18181B] ring-1 ring-[#18181B]/10"
          : "border-[#E2E2DE] hover:border-[#D4D4CE]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#18181B]">
            Tanker Gantry LB-01
          </h3>
          <p className="text-[11px] text-[#68686F] font-mono mt-0.5">
            Agent Sync : {lastScan}
          </p>
        </div>
        <span className="p-1 rounded-lg text-[#68686F] hover:bg-[#F7F7F4] hover:text-[#18181B]">
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>

      {/* EVORA Domain Vector: Tanker Loading Gantry Canopy + Fuel Tanker Truck + Worker Agents */}
      <div className="my-2 flex items-center justify-center">
        <svg
          viewBox="0 0 180 135"
          className="w-full h-28"
          aria-hidden="true"
        >
          {/* Gantry Canopy Roof & Columns */}
          <rect
            x="20"
            y="22"
            width="140"
            height="12"
            rx="2"
            fill="#D4D2CC"
            stroke="#52525B"
            strokeWidth="1.3"
          />
          <rect x="28" y="34" width="7" height="76" fill="#C4C0B6" />
          <rect x="145" y="34" width="7" height="76" fill="#C4C0B6" />

          {/* Pantograph Loading Arm */}
          <path
            d="M 68 34 L 68 54 L 84 68"
            fill="none"
            stroke="#52525B"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Road Fuel Tanker Truck */}
          <rect
            x="40"
            y="64"
            width="72"
            height="30"
            rx="13"
            fill="#FFFFFF"
            stroke="#52525B"
            strokeWidth="1.4"
          />
          <rect x="46" y="76" width="60" height="5" rx="2" fill="#C84B28" />
          <path
            d="M 114 70 L 134 70 L 138 82 L 138 96 L 114 96 Z"
            fill="#E5E3DD"
            stroke="#52525B"
            strokeWidth="1.3"
          />
          <circle cx="56" cy="100" r="7" fill="#27272A" />
          <circle cx="96" cy="100" r="7" fill="#27272A" />
          <circle cx="126" cy="100" r="7" fill="#27272A" />

          {/* Ground Island */}
          <rect
            x="16"
            y="108"
            width="148"
            height="10"
            rx="3"
            fill="#D4D2CC"
            stroke="#8A8880"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-[11px] font-mono text-[#68686F]">
          #LB-01 ({routeCode})
        </span>
        <Badge variant={variant} dot>
          {status}
        </Badge>
      </div>
    </div>
  );
}

export function ContainmentCorridorCard({
  corridorName = "Dynamic Signage SGN-01 & UPS Backup",
  status = "Safe",
  lastScan = "09:51 WIB",
  riskScore = 26,
  selected = false,
  onSelect,
}: {
  corridorName?: string;
  status?: "Safe" | "Risk" | "Blocked";
  lastScan?: string;
  riskScore?: number;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const variant =
    status === "Blocked"
      ? "critical"
      : status === "Risk"
      ? "warning"
      : "safe";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      aria-label={`Inspect ${corridorName}, status ${status}, risk score ${riskScore}`}
      className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03),0_1px_6px_rgba(0,0,0,0.04)] ${
        selected
          ? "border-[#18181B] ring-1 ring-[#18181B]/10"
          : "border-[#E2E2DE] hover:border-[#D4D4CE]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#18181B]">
            {corridorName}
          </h3>
          <p className="text-[11px] text-[#68686F] font-mono mt-0.5">
            Backup Power : 24V UPS Active · Route Risk : {riskScore}/100 (Threshold &lt;= 65)
          </p>
        </div>
        <Badge variant={variant} dot>
          {status}
        </Badge>
      </div>

      {/* EVORA Domain Vector: Dynamic Evacuation LED Signboard + Backup Power UPS + Muster Gate */}
      <div className="mt-3 pt-1 flex items-center justify-center">
        <svg
          viewBox="0 0 340 86"
          className="w-full h-20"
          aria-hidden="true"
        >
          {/* Left: UPS Battery Backup Cabinet (Catu Daya Cadangan) */}
          <rect
            x="16"
            y="14"
            width="68"
            height="58"
            rx="6"
            fill="#F7F7F4"
            stroke="#D4D4CE"
            strokeWidth="1.4"
          />
          <circle cx="28" cy="28" r="3.5" fill="#16A34A" />
          <text
            x="36"
            y="31"
            fill="#18181B"
            fontSize="8.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            UPS 24V
          </text>
          <text
            x="26"
            y="47"
            fill="#52525B"
            fontSize="8"
            fontFamily="monospace"
          >
            BACKUP ON
          </text>
          <text
            x="26"
            y="60"
            fill="#15803D"
            fontSize="8"
            fontWeight="700"
            fontFamily="monospace"
          >
            98% CHARGE
          </text>

          {/* Power & Telemetry Conduit */}
          <line
            x1="84"
            y1="43"
            x2="108"
            y2="43"
            stroke="#52525B"
            strokeWidth="2"
            strokeDasharray="4 3"
          />

          {/* Right: Field Dynamic LED Evacuation Signboard */}
          <rect
            x="108"
            y="12"
            width="216"
            height="62"
            rx="8"
            fill="#FFFFFF"
            stroke="#18181B"
            strokeWidth="1.6"
          />
          <rect
            x="118"
            y="22"
            width="42"
            height="42"
            rx="7"
            fill="#18181B"
          />
          <path
            d="M 129 43 L 149 43 M 142 36 L 149 43 L 142 50"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <text
            x="170"
            y="34"
            fill="#52525B"
            fontSize="8.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            FIELD LED SIGNAGE · SGN-NW-01
          </text>
          <text
            x="170"
            y="50"
            fill="#18181B"
            fontSize="10.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            PROCEED TO AP-ALPHA
          </text>
          <text
            x="170"
            y="64"
            fill="#15803D"
            fontSize="8.5"
            fontWeight="600"
            fontFamily="monospace"
          >
            DIST 245m · EXP 16 · DENS 24
          </text>
        </svg>
      </div>
    </div>
  );
}
