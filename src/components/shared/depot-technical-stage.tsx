"use client";

import React, { useState } from "react";
import {
  Crosshair,
  Flame,
  Maximize2,
  Network,
  ZoomIn,
} from "lucide-react";
import { useEvora } from "@/lib/evora-context";
import { FacilitySchematicMap } from "@/components/shared/facility-schematic-map";

export type StagePlaneMode = "front" | "isometric" | "top";

export function DepotTechnicalStage({
  stageTitle = "Downstream Fuel Depot",
  stageNumber = "#TBBM-01",
  defaultPlane = "front",
  highlightedSubsystem = null,
  onSelectSubsystem,
}: {
  stageTitle?: string;
  stageNumber?: string;
  defaultPlane?: StagePlaneMode;
  highlightedSubsystem?: string | null;
  onSelectSubsystem?: (id: string | null) => void;
}) {
  const {
    facilities,
    selectedFacilityId,
    currentFacility,
    setSelectedFacilityId,
    assets,
    sensors,
    hazards,
    routes,
    workers,
    triggerHazardExpansion,
    resetDemoState,
    hazardExpansionStep,
  } = useEvora();

  const [planeMode, setPlaneMode] = useState<StagePlaneMode>(defaultPlane);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(1);

  const recommendedRoute =
    routes.find((r) => r.status === "recommended") ?? routes[0];
  const gasSensor =
    sensors.find((s) => s.id === "SNS-GAS-02") ?? sensors[0];
  const tempSensor =
    sensors.find((s) => s.id === "SNS-TMP-01") ?? sensors[0];
  const smokeSensor =
    sensors.find((s) => s.id === "SNS-SMK-01") ?? sensors[0];

  const handleCycleZoom = () => {
    setZoomScale((prev) => (prev === 1 ? 1.12 : prev === 1.12 ? 1.24 : 1));
  };

  return (
    <section
      aria-label={`${stageTitle} ${stageNumber} interactive technical stage`}
      className="relative flex flex-col justify-between"
    >
      {/* Stage Top Header Row: Title + Pills on Left, 4 Square Tool Buttons on Right */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight text-[#18181B] leading-tight">
            {stageTitle}{" "}
            <span className="text-[#C84B28] font-normal">{stageNumber}</span>
          </h1>

          {/* Two Metadata Pills below Title */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] bg-white border border-[#E2E2DE] text-xs font-medium text-[#18181B] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <Network
                className="w-3.5 h-3.5 text-[#52525B] shrink-0"
                aria-hidden="true"
              />
              <label htmlFor="stage-zone-selector" className="sr-only">
                Select depot sector
              </label>
              <select
                id="stage-zone-selector"
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                className="bg-transparent font-semibold text-[#18181B] pr-1 focus:outline-none"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id === "depot-alpha"
                      ? "Tank Farm, Manifold & Gantry (DEMO-TBBM-01)"
                      : "LPG Sphere & Inland Truck Rack (DEMO-TBBM-02)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 h-9 rounded-[10px] bg-[#F1F1EE] border border-[#E2E2DE]/60 text-xs text-[#52525B]">
              <span>Wind :</span>
              <strong className="text-[#18181B] font-mono font-semibold">
                {currentFacility.windSpeedMps} m/s {currentFacility.windDirectionLabel}
              </strong>
              <span className="text-[#D4D4CE]">|</span>
              <span>Telemetry :</span>
              <strong className="text-[#18181B] font-semibold">
                IoT Sync Active
              </strong>
            </div>
          </div>
        </div>

        {/* 4 Square Floating Tool Buttons */}
        <div
          role="toolbar"
          aria-label="Technical stage tools"
          className="flex items-center gap-2 self-start"
        >
          <button
            type="button"
            onClick={() => setShowAnnotations((v) => !v)}
            aria-pressed={showAnnotations}
            aria-label="Toggle telemetry and route callout annotations"
            title="Toggle IoT telemetry and dynamic signage callouts"
            className={`w-10 h-10 rounded-[10px] flex items-center justify-center border transition-all ${
              showAnnotations
                ? "btn-embossed"
                : "bg-white text-[#18181B] border-[#E2E2DE] hover:bg-[#F7F7F4]"
            }`}
          >
            <Crosshair className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleCycleZoom}
            aria-label={`Cycle stage zoom (currently ${Math.round(zoomScale * 100)}%)`}
            title={`Zoom (${Math.round(zoomScale * 100)}%)`}
            className="w-10 h-10 rounded-[10px] bg-white border border-[#E2E2DE] hover:bg-[#F7F7F4] text-[#18181B] flex items-center justify-center transition-colors"
          >
            <ZoomIn className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              setZoomScale(1);
              onSelectSubsystem?.(null);
              resetDemoState();
            }}
            aria-label="Reset stage zoom and restore baseline state"
            title="Reset stage view & baseline"
            className="w-10 h-10 rounded-[10px] bg-white border border-[#E2E2DE] hover:bg-[#F7F7F4] text-[#18181B] flex items-center justify-center transition-colors"
          >
            <Maximize2 className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={triggerHazardExpansion}
            aria-label="Simulate multi-hazard expansion and adaptive route recalculation"
            title="Trigger Multi-Hazard Plume Expansion (Block Route A -> Recommend Route B)"
            className={`w-10 h-10 rounded-[10px] flex items-center justify-center border transition-all ${
              hazardExpansionStep > 0
                ? "bg-[#C84B28] text-white border-[#C84B28]"
                : "bg-white text-[#18181B] border-[#E2E2DE] hover:bg-[#F7F7F4]"
            }`}
          >
            <Flame className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Technical Illustration Canvas: EVORA Downstream Fuel Storage & Distribution Depot (TBBM) */}
      {planeMode === "front" ? (
        <div className="relative overflow-hidden rounded-2xl bg-[#F7F7F4] pt-1 pb-2">
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: "center center",
            }}
            className="transition-transform duration-200"
          >
            <svg
              viewBox="0 0 920 390"
              role="img"
              aria-label={`Architectural elevation schematic of ${currentFacility.name}: Fuel Storage Tanks T-101 and T-102, Central Pipe Manifold PIPE-01, Tanker Loading Gantry LB-01, and Dynamic Evacuation Signage SGN-01 with UPS backup`}
              className="w-full h-auto block select-none"
            >
              {/* ============================================================
                  OVERHEAD PIPE BRIDGE, IOT TELEMETRY BUS & ANEMOMETER MAST
                  ============================================================ */}
              <rect
                x="0"
                y="28"
                width="920"
                height="12"
                fill="#DCD9D0"
                stroke="#C4C0B6"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="34"
                x2="920"
                y2="34"
                stroke="#B8B4AA"
                strokeWidth="1"
                strokeDasharray="8 6"
              />
              {[68, 224, 360, 505, 650, 795].map((px) => (
                <rect
                  key={px}
                  x={px - 7}
                  y="24"
                  width="14"
                  height="20"
                  rx="2"
                  fill="#CECAC0"
                  stroke="#B4B0A6"
                  strokeWidth="1"
                />
              ))}

              {/* Vertical Pipe Bridge Support Columns */}
              <rect x="62" y="40" width="12" height="296" fill="#E5E3DD" />
              <rect x="354" y="40" width="12" height="270" fill="#E5E3DD" />
              <rect x="644" y="40" width="12" height="296" fill="#E5E3DD" />
              <rect x="789" y="40" width="12" height="296" fill="#E5E3DD" />

              {/* Ultrasonic Wind Anemometer Mast WN-501 on Left Column */}
              <g transform="translate(68, 8)">
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="20"
                  stroke="#52525B"
                  strokeWidth="2"
                />
                <line
                  x1="-12"
                  y1="6"
                  x2="12"
                  y2="6"
                  stroke="#52525B"
                  strokeWidth="1.5"
                />
                <circle cx="-12" cy="6" r="2.5" fill="#18181B" />
                <circle cx="12" cy="6" r="2.5" fill="#18181B" />
                <polygon points="0,0 10,3 0,6" fill="#C84B28" />
              </g>

              {/* ============================================================
                  ZONE 1 (LEFT, x=22..295): SECONDARY CONTAINMENT BUND &
                  FUEL STORAGE TANKS T-101 (RON 92) & T-102 (RON 90)
                  ============================================================ */}
              <g
                onClick={() => onSelectSubsystem?.("manifold")}
                className="cursor-pointer"
              >
                {/* Tank T-101 (Fixed Cone-Roof Tank, Left) */}
                <g transform="translate(38, 128)">
                  {/* Cone Roof */}
                  <polygon
                    points="0,28 52,4 104,28"
                    fill="#D4D2CC"
                    stroke="#8A8880"
                    strokeWidth="1.5"
                  />
                  {/* Breather Vent on Peak */}
                  <rect
                    x="48"
                    y="-4"
                    width="8"
                    height="9"
                    rx="1"
                    fill="#71717A"
                  />
                  {/* Cylindrical Shell Courses */}
                  <rect
                    x="0"
                    y="28"
                    width="104"
                    height="178"
                    fill="#E5E3DD"
                    stroke="#8A8880"
                    strokeWidth="1.5"
                  />
                  {/* Horizontal Shell Plate Weld Seams */}
                  {[62, 98, 134, 170].map((sy) => (
                    <line
                      key={sy}
                      x1="0"
                      y1={sy}
                      x2="104"
                      y2={sy}
                      stroke="#C4C0B6"
                      strokeWidth="1.2"
                    />
                  ))}
                  {/* Spiral Gauging Stairway */}
                  <path
                    d="M 14 206 L 36 170 L 58 134 L 80 98 L 92 62"
                    fill="none"
                    stroke="#71717A"
                    strokeWidth="2"
                  />
                  {/* Tank Identifier Plate */}
                  <rect
                    x="22"
                    y="72"
                    width="60"
                    height="30"
                    rx="4"
                    fill="#FFFFFF"
                    stroke="#C4C0B6"
                    strokeWidth="1.2"
                  />
                  <text
                    x="52"
                    y="85"
                    textAnchor="middle"
                    fill="#18181B"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    T-101
                  </text>
                  <text
                    x="52"
                    y="96"
                    textAnchor="middle"
                    fill="#52525B"
                    fontSize="8"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    RON 92
                  </text>
                  {/* Optical Gas Sensor Node GS-201 on Lower Shell */}
                  <circle
                    cx="14"
                    cy="184"
                    r="4.5"
                    fill="#16A34A"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </g>

                {/* Tank T-102 (Floating-Roof Tank, Primary Thermal & Rim-Seal Hazard Origin) */}
                <g transform="translate(158, 118)">
                  {/* Floating Roof Rim & Foam Dam */}
                  <rect
                    x="6"
                    y="20"
                    width="108"
                    height="12"
                    fill="#D4D2CC"
                    stroke="#8A8880"
                    strokeWidth="1.4"
                  />
                  {/* Rim-Seal Radiant Heat / Ignition Indicator on T-102 Top Rim */}
                  <ellipse
                    cx="60"
                    cy="20"
                    rx="48"
                    ry="10"
                    fill="rgba(200, 75, 40, 0.22)"
                    stroke="#C84B28"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {/* Main Cylindrical Tank Shell */}
                  <rect
                    x="0"
                    y="30"
                    width="120"
                    height="186"
                    fill="#DFDDD6"
                    stroke={
                      highlightedSubsystem === "manifold"
                        ? "#18181B"
                        : "#C84B28"
                    }
                    strokeWidth={highlightedSubsystem === "manifold" ? "2.5" : "1.8"}
                  />
                  {/* Shell Plate Courses */}
                  {[66, 104, 142, 180].map((sy) => (
                    <line
                      key={sy}
                      x1="0"
                      y1={sy}
                      x2="120"
                      y2={sy}
                      stroke="#C4C0B6"
                      strokeWidth="1.2"
                    />
                  ))}
                  {/* Red/White Safety Band near Top Course (Pertamina TBBM Standard) */}
                  <rect
                    x="1"
                    y="31"
                    width="118"
                    height="10"
                    fill="#C84B28"
                    opacity="0.85"
                  />
                  {/* Foam Deluge Cooling Riser Pipe along Right Wall */}
                  <line
                    x1="114"
                    y1="26"
                    x2="114"
                    y2="216"
                    stroke="#52525B"
                    strokeWidth="2.5"
                  />
                  {/* Tank T-102 Nameplate */}
                  <rect
                    x="24"
                    y="76"
                    width="72"
                    height="34"
                    rx="4"
                    fill="#FFFFFF"
                    stroke="#C84B28"
                    strokeWidth="1.4"
                  />
                  <text
                    x="60"
                    y="90"
                    textAnchor="middle"
                    fill="#18181B"
                    fontSize="10.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    T-102
                  </text>
                  <text
                    x="60"
                    y="102"
                    textAnchor="middle"
                    fill="#C84B28"
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {tempSensor.value}°C RIM
                  </text>

                  {/* UV/IR Flame Detector FL-401 & Thermal Probe TS-102 */}
                  <circle
                    cx="98"
                    cy="24"
                    r="5"
                    fill="#D97706"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="104"
                    cy="158"
                    r="5"
                    fill="#D97706"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </g>

                {/* Concrete Secondary Containment Bund Wall Enclosing Tanks T-101 & T-102 */}
                <rect
                  x="22"
                  y="314"
                  width="272"
                  height="22"
                  rx="3"
                  fill="#C4C1B8"
                  stroke="#71717A"
                  strokeWidth="1.5"
                />
                <rect
                  x="22"
                  y="292"
                  width="12"
                  height="44"
                  rx="2"
                  fill="#B8B4AA"
                  stroke="#71717A"
                  strokeWidth="1.4"
                />
                <rect
                  x="282"
                  y="292"
                  width="12"
                  height="44"
                  rx="2"
                  fill="#B8B4AA"
                  stroke="#71717A"
                  strokeWidth="1.4"
                />
                <text
                  x="158"
                  y="328"
                  textAnchor="middle"
                  fill="#18181B"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  SECONDARY CONTAINMENT BUND WALL (TANK FARM NORTH)
                </text>
              </g>

              {/* ============================================================
                  ZONE 2 (CENTER, x=298..515): CENTRAL PIPE MANIFOLD (PIPE-01)
                  & MULTI-HAZARD VAPOR / SMOKE DISPERSION PLUME
                  ============================================================ */}
              <g
                onClick={() => onSelectSubsystem?.("manifold")}
                className="cursor-pointer"
              >
                {/* Transfer Pipeline Header from Tank T-102 into Manifold */}
                <rect
                  x="278"
                  y="246"
                  width="242"
                  height="12"
                  fill="#A8A49C"
                  stroke="#52525B"
                  strokeWidth="1.4"
                />
                <rect
                  x="298"
                  y="268"
                  width="222"
                  height="10"
                  fill="#B8B4AA"
                  stroke="#52525B"
                  strokeWidth="1.2"
                />

                {/* Manifold Skid Concrete Plinth */}
                <rect
                  x="312"
                  y="310"
                  width="186"
                  height="26"
                  rx="3"
                  fill="#D4D2CC"
                  stroke="#71717A"
                  strokeWidth="1.5"
                />
                <text
                  x="405"
                  y="326"
                  textAnchor="middle"
                  fill="#18181B"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  PIPE-01 · CENTRAL MANIFOLD SKID
                </text>

                {/* Vertical Riser Spools & Motorized Gate Valves (F-12 Leak Origin) */}
                {[338, 382, 426, 470].map((vx, i) => (
                  <g key={vx}>
                    <rect
                      x={vx - 6}
                      y="218"
                      width="12"
                      height="92"
                      fill="#D4D2CC"
                      stroke="#52525B"
                      strokeWidth="1.3"
                    />
                    {/* Flanged Valve Body */}
                    <rect
                      x={vx - 11}
                      y="240"
                      width="22"
                      height="24"
                      rx="3"
                      fill={i === 1 ? "#C84B28" : "#71717A"}
                      stroke="#3F3F46"
                      strokeWidth="1.3"
                    />
                    {/* Actuator Handwheel */}
                    <circle
                      cx={vx}
                      cy="226"
                      r="7"
                      fill="#FFFFFF"
                      stroke={i === 1 ? "#C84B28" : "#52525B"}
                      strokeWidth="2"
                    />
                  </g>
                ))}

                {/* Multi-Hazard Hydrocarbon Vapor & Smoke Plume Envelope around Flange F-12 */}
                <circle
                  cx="392"
                  cy="242"
                  r={hazardExpansionStep > 0 ? 78 : 54}
                  fill={
                    hazardExpansionStep > 0
                      ? "rgba(200, 75, 40, 0.22)"
                      : "rgba(200, 75, 40, 0.14)"
                  }
                  stroke="#C84B28"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <circle
                  cx="438"
                  cy="232"
                  r={hazardExpansionStep > 0 ? 58 : 40}
                  fill="rgba(113, 113, 122, 0.14)"
                  stroke="#52525B"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Catalytic Gas Detector GS-204 & Smoke Sensor SM-301 Nodes */}
                <circle
                  cx="382"
                  cy="252"
                  r="5.5"
                  fill="#C84B28"
                  stroke="#FFFFFF"
                  strokeWidth="1.75"
                />
                <circle
                  cx="426"
                  cy="252"
                  r="5"
                  fill="#D97706"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </g>

              {/* ============================================================
                  ZONE 3 (CENTER-RIGHT, x=520..748): TANKER LOADING GANTRY LB-01
                  & ROAD FUEL TANKER TRUCK + VIRTUAL WORKER AGENTS
                  ============================================================ */}
              <g
                onClick={() => onSelectSubsystem?.("corridor")}
                className="cursor-pointer"
              >
                {/* Steel Gantry Portal Frame & Roof Canopy */}
                <rect
                  x="524"
                  y="132"
                  width="216"
                  height="16"
                  rx="3"
                  fill="#D4D2CC"
                  stroke="#52525B"
                  strokeWidth="1.5"
                />
                <rect
                  x="530"
                  y="120"
                  width="204"
                  height="12"
                  rx="2"
                  fill="#E5E3DD"
                  stroke="#8A8880"
                  strokeWidth="1.2"
                />
                <text
                  x="632"
                  y="143"
                  textAnchor="middle"
                  fill="#18181B"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  LB-01 · TANKER LOADING GANTRY BAY A
                </text>

                {/* Gantry Steel Columns */}
                <rect
                  x="534"
                  y="148"
                  width="10"
                  height="166"
                  fill="#C4C0B6"
                  stroke="#71717A"
                  strokeWidth="1.2"
                />
                <rect
                  x="720"
                  y="148"
                  width="10"
                  height="166"
                  fill="#C4C0B6"
                  stroke="#71717A"
                  strokeWidth="1.2"
                />

                {/* Articulated Pantograph Bottom-Loading Fuel Arms */}
                <path
                  d="M 580 148 L 580 182 L 602 208 L 602 232"
                  fill="none"
                  stroke="#52525B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 642 148 L 642 182 L 624 208 L 624 232"
                  fill="none"
                  stroke="#52525B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Road Fuel Tanker Truck (Truk Tangki BBM 24 KL) in Bay LB-01 */}
                <g transform="translate(554, 224)">
                  {/* Tanker Cylindrical Vessel */}
                  <rect
                    x="0"
                    y="6"
                    width="112"
                    height="46"
                    rx="20"
                    fill="#FFFFFF"
                    stroke="#52525B"
                    strokeWidth="1.6"
                  />
                  {/* Pertamina-style Red/Teal Accent Stripe on Tanker */}
                  <rect
                    x="8"
                    y="24"
                    width="96"
                    height="7"
                    rx="3"
                    fill="#C84B28"
                  />
                  <text
                    x="56"
                    y="20"
                    textAnchor="middle"
                    fill="#18181B"
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    TANKER 24 KL
                  </text>
                  {/* Truck Cab */}
                  <path
                    d="M 114 16 L 142 16 L 150 32 L 150 54 L 114 54 Z"
                    fill="#E5E3DD"
                    stroke="#52525B"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="128"
                    y="20"
                    width="16"
                    height="12"
                    rx="2"
                    fill="#FFFFFF"
                    stroke="#71717A"
                    strokeWidth="1.2"
                  />
                  {/* Chassis Rail */}
                  <rect
                    x="4"
                    y="52"
                    width="146"
                    height="7"
                    rx="2"
                    fill="#52525B"
                  />
                  {/* Road Wheels */}
                  {[22, 44, 92, 134].map((wx) => (
                    <g key={wx}>
                      <circle
                        cx={wx}
                        cy="64"
                        r="10"
                        fill="#27272A"
                        stroke="#18181B"
                        strokeWidth="1.5"
                      />
                      <circle cx={wx} cy="64" r="4" fill="#D4D2CC" />
                    </g>
                  ))}
                </g>

                {/* Gantry Loading Island Apron */}
                <rect
                  x="522"
                  y="314"
                  width="220"
                  height="22"
                  rx="3"
                  fill="#D4D2CC"
                  stroke="#71717A"
                  strokeWidth="1.5"
                />
                <text
                  x="632"
                  y="328"
                  textAnchor="middle"
                  fill="#18181B"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  GANTRY ISLAND APRON (11 WORKERS)
                </text>
              </g>

              {/* ============================================================
                  ZONE 4 (FAR RIGHT, x=756..908): DYNAMIC EVACUATION SIGNAGE
                  WITH BACKUP POWER (UPS) & ASSEMBLY POINT ALPHA MUSTER
                  ============================================================ */}
              <g
                onClick={() => onSelectSubsystem?.("signage")}
                className="cursor-pointer"
              >
                {/* Dynamic Signage Support Post */}
                <rect
                  x="792"
                  y="142"
                  width="8"
                  height="172"
                  fill="#71717A"
                />

                {/* Backup Power Supply Cabinet (Catu Daya Cadangan / UPS Battery) */}
                <rect
                  x="772"
                  y="236"
                  width="48"
                  height="56"
                  rx="5"
                  fill="#FFFFFF"
                  stroke="#18181B"
                  strokeWidth="1.6"
                />
                <rect
                  x="776"
                  y="240"
                  width="40"
                  height="14"
                  rx="2"
                  fill="#F7F7F4"
                />
                <circle cx="783" cy="247" r="3" fill="#16A34A" />
                <text
                  x="798"
                  y="250"
                  textAnchor="middle"
                  fill="#18181B"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  UPS
                </text>
                <text
                  x="796"
                  y="268"
                  textAnchor="middle"
                  fill="#52525B"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  BACKUP
                </text>
                <text
                  x="796"
                  y="280"
                  textAnchor="middle"
                  fill="#15803D"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  24V OK
                </text>

                {/* Assembly Point Shelter Canopy (AP-ALPHA / AP-BRAVO) */}
                <polygon
                  points="832,188 868,168 904,188"
                  fill="#D4D2CC"
                  stroke="#16A34A"
                  strokeWidth="1.6"
                />
                <rect
                  x="836"
                  y="188"
                  width="64"
                  height="126"
                  rx="6"
                  fill="#FFFFFF"
                  stroke="#16A34A"
                  strokeWidth="1.8"
                />
                <rect
                  x="842"
                  y="196"
                  width="52"
                  height="24"
                  rx="4"
                  fill="#F7F7F4"
                  stroke="#BBF7D0"
                  strokeWidth="1.2"
                />
                <text
                  x="868"
                  y="207"
                  textAnchor="middle"
                  fill="#15803D"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  MUSTER
                </text>
                <text
                  x="868"
                  y="216"
                  textAnchor="middle"
                  fill="#18181B"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {hazardExpansionStep > 0 ? "AP-BRAVO" : "AP-ALPHA"}
                </text>

                {/* Evacuating Worker Agents Moving Along Adaptive Corridor into Muster Point */}
                {[
                  { x: 752, y: 288, status: "moving" },
                  { x: 822, y: 288, status: "moving" },
                  { x: 856, y: 288, status: "safe" },
                  { x: 878, y: 288, status: "safe" },
                ].map((agent, idx) => (
                  <g key={idx} transform={`translate(${agent.x}, ${agent.y})`}>
                    <circle
                      cx="0"
                      cy="-14"
                      r="5"
                      fill={agent.status === "safe" ? "#16A34A" : "#2563EB"}
                    />
                    <rect
                      x="-4"
                      y="-7"
                      width="8"
                      height="16"
                      rx="3"
                      fill={agent.status === "safe" ? "#16A34A" : "#2563EB"}
                    />
                    <line
                      x1="-3"
                      y1="9"
                      x2="-5"
                      y2="22"
                      stroke="#18181B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="3"
                      y1="9"
                      x2="5"
                      y2="22"
                      stroke="#18181B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </g>
                ))}

                {/* Emergency Egress Corridor Deck */}
                <rect
                  x="756"
                  y="314"
                  width="150"
                  height="22"
                  rx="3"
                  fill="#FFFFFF"
                  stroke="#16A34A"
                  strokeWidth="1.6"
                />
                <text
                  x="831"
                  y="328"
                  textAnchor="middle"
                  fill="#15803D"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  ADAPTIVE EGRESS CORRIDOR
                </text>
              </g>

              {/* Continuous Ground Grade & Adaptive Evacuation Direction Track */}
              <rect
                x="16"
                y="342"
                width="890"
                height="24"
                rx="6"
                fill="#ECECE8"
                stroke="#D4D4CE"
                strokeWidth="1.2"
              />
              <line
                x1="32"
                y1="354"
                x2="520"
                y2="354"
                stroke="#C84B28"
                strokeWidth="2.5"
                strokeDasharray="6 5"
              />
              <line
                x1="540"
                y1="354"
                x2="885"
                y2="354"
                stroke="#16A34A"
                strokeWidth="3"
              />
              <polygon points="892,354 882,349 882,359" fill="#16A34A" />
              <text
                x="265"
                y="357"
                textAnchor="middle"
                fill="#991B1B"
                fontSize="8.5"
                fontWeight="700"
                fontFamily="monospace"
              >
                RESTRICTED HAZARD ZONE (RISK &gt; THRESHOLD 65)
              </text>
              <text
                x="710"
                y="357"
                textAnchor="middle"
                fill="#15803D"
                fontSize="8.5"
                fontWeight="700"
                fontFamily="monospace"
              >
                ACTIVE EVACUATION VECTOR ({recommendedRoute?.shortCode ?? "ROUTE A"} · RISK {recommendedRoute?.riskScore ?? 26}/100)
              </text>

              {/* ============================================================
                  NON-OVERLAPPING TOP TELEMETRY & DYNAMIC SIGNAGE CALLOUT CARDS
                  ============================================================ */}
              {showAnnotations && (
                <g>
                  {/* Callout 1 (Left): Tank T-102 Thermal & Flame IoT Sensor Array */}
                  <g transform="translate(82, 54)">
                    <rect
                      x="0"
                      y="0"
                      width="202"
                      height="42"
                      rx="8"
                      fill="#FFFFFF"
                      stroke="#E2E2DE"
                      strokeWidth="1.5"
                    />
                    <circle cx="14" cy="15" r="4" fill="#D97706" />
                    <text
                      x="25"
                      y="18"
                      fill="#52525B"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      IOT THERMAL &amp; FLAME (T-102)
                    </text>
                    <text
                      x="25"
                      y="33"
                      fill="#18181B"
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      TS-102: {tempSensor.value}°C · FL-401: 68 IR
                    </text>
                  </g>

                  {/* Callout 2 (Center): Central Pipe Manifold Gas & Smoke Plume */}
                  <g transform="translate(306, 54)">
                    <rect
                      x="0"
                      y="0"
                      width="228"
                      height="42"
                      rx="8"
                      fill="#FFFFFF"
                      stroke="#C84B28"
                      strokeWidth="1.5"
                    />
                    <circle cx="14" cy="15" r="4" fill="#C84B28" />
                    <text
                      x="25"
                      y="18"
                      fill="#52525B"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      MANIFOLD MULTI-HAZARD (PIPE-01)
                    </text>
                    <text
                      x="25"
                      y="33"
                      fill="#18181B"
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      GS-204: {gasSensor.value}% LEL · SM-301: {smokeSensor.value} ppm
                    </text>
                  </g>

                  {/* Callout 3 (Right): Dynamic Evacuation Signage with UPS Backup */}
                  <g transform="translate(556, 50)">
                    <rect
                      x="0"
                      y="0"
                      width="348"
                      height="50"
                      rx="10"
                      fill="#FFFFFF"
                      stroke="#E2E2DE"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="8"
                      y="8"
                      width="34"
                      height="34"
                      rx="7"
                      fill={hazardExpansionStep > 0 ? "#C84B28" : "#18181B"}
                    />
                    <path
                      d="M 17 25 L 33 25 M 27 19 L 33 25 L 27 31"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <text
                      x="52"
                      y="21"
                      fill="#52525B"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      {hazardExpansionStep > 0
                        ? "DYNAMIC SIGNAGE SGN-01 · REROUTED (UPS BACKUP)"
                        : "DYNAMIC SIGNAGE SGN-01 · ACTIVE SAFE (UPS BACKUP)"}
                    </text>
                    <text
                      x="52"
                      y="37"
                      fill="#18181B"
                      fontSize="10.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {recommendedRoute
                        ? `${recommendedRoute.shortCode} -> ${
                            recommendedRoute.destinationName.split(" (")[0]
                          } (${recommendedRoute.distanceMeters}m)`
                        : "SHELTER IN PLACE PROTOCOL"}
                    </text>
                  </g>
                </g>
              )}
            </svg>
          </div>
        </div>
      ) : (
        /* Isometric or Top Plane View using FacilitySchematicMap */
        <div className="my-1">
          <FacilitySchematicMap
            facilityName={currentFacility.name}
            facilityCode={currentFacility.code}
            windSpeedMps={currentFacility.windSpeedMps}
            windDirectionDeg={currentFacility.windDirectionDeg}
            windDirectionLabel={currentFacility.windDirectionLabel}
            assets={assets}
            sensors={sensors}
            hazards={hazards}
            routes={routes}
            workers={workers}
            showLayerToolbar={planeMode === "isometric"}
            showViewModeToggle={true}
          />
        </div>
      )}

      {/* Stage Bottom Bar: Plane Tabs (Front elevation | Isometric | Top plan) on Left + Y/X Axis Gizmo on Right */}
      <div className="flex items-center justify-between gap-4 mt-2 pt-1">
        <div
          role="tablist"
          aria-label="Technical projection plane selector"
          className="inline-flex items-center gap-1 p-1 rounded-[10px] bg-[#F1F1EE] border border-[#E2E2DE]/60"
        >
          {(
            [
              { key: "front", label: "Depot Elevation (TBBM)" },
              { key: "isometric", label: "Digital Twin Layers" },
              { key: "top", label: "2D Facility Plan" },
            ] as const
          ).map((tab) => {
            const active = planeMode === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPlaneMode(tab.key)}
                className={`px-3.5 py-1.5 min-h-[32px] rounded-[8px] text-xs font-medium transition-all ${
                  active
                    ? "bg-white text-[#18181B] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-[#52525B] hover:text-[#18181B]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Y / X Coordinate Axis Gizmo */}
        <div
          aria-hidden="true"
          className="flex items-center pr-2"
          title="Stage Coordinate Frame (X-Y)"
        >
          <svg viewBox="0 0 54 54" className="w-11 h-11">
            <text
              x="11"
              y="10"
              fill="#C84B28"
              fontSize="9"
              fontWeight="700"
              fontFamily="monospace"
            >
              Y
            </text>
            <text
              x="44"
              y="44"
              fill="#D98A19"
              fontSize="9"
              fontWeight="700"
              fontFamily="monospace"
            >
              X
            </text>
            <line
              x1="14"
              y1="40"
              x2="14"
              y2="15"
              stroke="#C84B28"
              strokeWidth="2"
            />
            <polygon points="14,11 10,18 18,18" fill="#C84B28" />
            <line
              x1="14"
              y1="40"
              x2="39"
              y2="40"
              stroke="#D98A19"
              strokeWidth="2"
            />
            <polygon points="43,40 36,36 36,44" fill="#D98A19" />
            <rect
              x="11"
              y="37"
              width="6"
              height="6"
              rx="1"
              fill="#854D0E"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
