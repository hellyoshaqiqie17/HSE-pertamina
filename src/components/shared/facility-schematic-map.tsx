"use client";

import React, { useState } from "react";
import {
  Box,
  Compass,
  Layers,
  Map as MapIcon,
  Maximize2,
  Move,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  EvacuationRoute,
  FacilityAsset,
  HazardZone,
  Sensor,
  WorkerAgent,
} from "@/types/evora";
import {
  RiskBadge,
  SensorStatusBadge,
} from "@/components/shared/status-badge";

export interface MapLayerVisibility {
  assets: boolean;
  sensors: boolean;
  gas: boolean;
  temperature: boolean;
  smokeFire: boolean;
  wind: boolean;
  workers: boolean;
  riskZones: boolean;
  routes: boolean;
}

export const DEFAULT_MAP_LAYERS: MapLayerVisibility = {
  assets: true,
  sensors: true,
  gas: true,
  temperature: true,
  smokeFire: true,
  wind: true,
  workers: true,
  riskZones: true,
  routes: true,
};

interface FacilitySchematicMapProps {
  facilityName: string;
  facilityCode: string;
  windSpeedMps: number;
  windDirectionDeg: number;
  windDirectionLabel: string;
  assets: FacilityAsset[];
  sensors: Sensor[];
  hazards: HazardZone[];
  routes: EvacuationRoute[];
  workers: WorkerAgent[];
  layers?: MapLayerVisibility;
  onToggleLayer?: (key: keyof MapLayerVisibility) => void;
  showLayerToolbar?: boolean;
  showViewModeToggle?: boolean;
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string) => void;
  focusPoint?: { x: number; y: number; label: string } | null;
}

function getShortAssetLabel(asset: FacilityAsset): string {
  const map: Record<string, string> = {
    "PIPE-01": "CENTRAL PIPE MANIFOLD CORRIDOR",
    "LB-01": "GANTRY BAY A",
    "LB-02": "GANTRY BAY B",
    "VRU-01": "VAPOR RECOVERY",
    "OPS-01": "HSE OPERATIONS",
    "PIPE-B1": "SOUTH TRANSFER TRENCH",
    "LB-B1": "TRUCK LOADING RACK",
    "OPS-B1": "DEPOT CONTROL BLDG",
  };
  return (
    map[asset.code] ?? asset.name.split(" (")[0].slice(0, 18).toUpperCase()
  );
}

function formatCompactSensorValue(sensor: Sensor): string {
  if (sensor.status === "offline") return "OFFLINE";
  if (sensor.unit === "deg C") return `${sensor.value}°C`;
  if (sensor.unit === "% LEL") return `${sensor.value}% LEL`;
  if (sensor.unit === "IR Index") return `${sensor.value} IR`;
  if (sensor.unit === "m/s") return `${sensor.value} m/s`;
  return `${sensor.value} ${sensor.unit}`;
}

function getRoutePillAnchor(route: EvacuationRoute): { x: number; y: number } {
  if (route.id === "RT-ALPHA-A") return { x: 124, y: 218 };
  if (route.id === "RT-ALPHA-B") return { x: 432, y: 472 };
  if (route.id === "RT-ALPHA-C") return { x: 825, y: 258 };
  if (route.id === "RT-BETA-A") return { x: 140, y: 240 };
  if (route.id === "RT-BETA-B") return { x: 660, y: 455 };
  if (route.id === "RT-BETA-C") return { x: 635, y: 165 };
  const midIndex = Math.floor(route.waypoints.length / 2);
  return route.waypoints[midIndex] ?? route.waypoints[0];
}

export function FacilitySchematicMap({
  facilityName,
  facilityCode,
  windSpeedMps,
  windDirectionDeg,
  windDirectionLabel,
  assets,
  sensors,
  hazards,
  routes,
  workers,
  layers = DEFAULT_MAP_LAYERS,
  onToggleLayer,
  showLayerToolbar = false,
  showViewModeToggle = true,
  selectedRouteId,
  onSelectRoute,
  focusPoint,
}: FacilitySchematicMapProps) {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedAsset, setSelectedAsset] = useState<FacilityAsset | null>(
    null
  );
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<HazardZone | null>(null);

  const handleZoomIn = () =>
    setZoom((z) => Math.min(1.5, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () =>
    setZoom((z) => Math.max(0.85, Number((z - 0.15).toFixed(2))));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const clearSelection = () => {
    setSelectedAsset(null);
    setSelectedSensor(null);
    setSelectedHazard(null);
  };

  const visibleHazards = hazards.filter((h) => {
    if (!h.active || h.radius <= 0) return false;
    if (!layers.riskZones) return false;
    if (h.type === "gas" && !layers.gas) return false;
    if (h.type === "heat" && !layers.temperature) return false;
    if ((h.type === "fire" || h.type === "smoke") && !layers.smokeFire)
      return false;
    return true;
  });

  const visibleSensors = sensors.filter((sensor) => {
    if (!layers.sensors) return false;
    if (sensor.type === "gas" && !layers.gas) return false;
    if (sensor.type === "temperature" && !layers.temperature) return false;
    if (
      (sensor.type === "smoke" || sensor.type === "fire") &&
      !layers.smokeFire
    )
      return false;
    if (sensor.type === "wind" && !layers.wind) return false;
    return true;
  });

  const layerDefinitions: {
    key: keyof MapLayerVisibility;
    label: string;
  }[] = [
    { key: "assets", label: "Facility Assets" },
    { key: "sensors", label: "IoT Sensors" },
    { key: "gas", label: "Gas (% LEL)" },
    { key: "temperature", label: "Temperature" },
    { key: "smokeFire", label: "Smoke / Fire" },
    { key: "wind", label: "Wind Vector" },
    { key: "workers", label: "Worker Agents" },
    { key: "riskZones", label: "Risk Zones" },
    { key: "routes", label: "Evacuation Routes" },
  ];

  return (
    <div className="bg-white border border-[#E2E2DE] rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03),0_1px_6px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
      {/* Top Map Control Bar */}
      <div className="px-4 py-3 border-b border-[#ECECE8] bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE] text-[#18181B]">
            {facilityCode}
          </span>
          <span className="text-sm font-semibold text-[#18181B]">
            {facilityName}
          </span>
          {layers.wind && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE] text-xs font-mono text-[#52525B]">
              <Compass
                className="w-3.5 h-3.5 text-[#18181B]"
                aria-hidden="true"
              />
              <span>
                Wind:{" "}
                <strong className="text-[#18181B]">{windSpeedMps} m/s</strong>{" "}
                {windDirectionLabel}
              </span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showViewModeToggle && (
            <div
              role="group"
              aria-label="Schematic projection mode"
              className="inline-flex rounded-[10px] border border-[#E2E2DE] bg-[#F7F7F4] p-0.5"
            >
              <button
                type="button"
                onClick={() => setViewMode("2d")}
                aria-pressed={viewMode === "2d"}
                className={`inline-flex items-center gap-1.5 px-3 py-1 h-7 rounded-[8px] text-xs font-medium transition-all ${
                  viewMode === "2d"
                    ? "bg-white text-[#18181B] shadow-[0_1px_2px_rgba(0,0,0,0.06)] font-semibold"
                    : "text-[#52525B] hover:text-[#18181B]"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>2D Map</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                aria-pressed={viewMode === "3d"}
                className={`inline-flex items-center gap-1.5 px-3 py-1 h-7 rounded-[8px] text-xs font-medium transition-all ${
                  viewMode === "3d"
                    ? "bg-white text-[#18181B] shadow-[0_1px_2px_rgba(0,0,0,0.06)] font-semibold"
                    : "text-[#52525B] hover:text-[#18181B]"
                }`}
              >
                <Box className="w-3.5 h-3.5" aria-hidden="true" />
                <span>3D View</span>
              </button>
            </div>
          )}

          {/* Clean Pan Nudge Group in Header */}
          <div
            role="group"
            aria-label="Map pan controls"
            className="hidden sm:inline-flex items-center rounded-[10px] border border-[#E2E2DE] bg-white px-1 h-8 text-xs font-mono text-[#52525B]"
          >
            <Move
              className="w-3 h-3 mx-1.5 text-[#71717A]"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => setPan((p) => ({ ...p, x: p.x + 36 }))}
              aria-label="Pan schematic west"
              className="px-1.5 py-0.5 rounded hover:bg-[#F7F7F4] hover:text-[#18181B]"
            >
              W
            </button>
            <button
              type="button"
              onClick={() => setPan((p) => ({ ...p, y: p.y + 28 }))}
              aria-label="Pan schematic north"
              className="px-1.5 py-0.5 rounded hover:bg-[#F7F7F4] hover:text-[#18181B]"
            >
              N
            </button>
            <button
              type="button"
              onClick={() => setPan((p) => ({ ...p, y: p.y - 28 }))}
              aria-label="Pan schematic south"
              className="px-1.5 py-0.5 rounded hover:bg-[#F7F7F4] hover:text-[#18181B]"
            >
              S
            </button>
            <button
              type="button"
              onClick={() => setPan((p) => ({ ...p, x: p.x - 36 }))}
              aria-label="Pan schematic east"
              className="px-1.5 py-0.5 rounded hover:bg-[#F7F7F4] hover:text-[#18181B]"
            >
              E
            </button>
          </div>

          <div
            role="group"
            aria-label="Map zoom controls"
            className="inline-flex items-center rounded-[10px] border border-[#E2E2DE] bg-white h-8"
          >
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out map"
              className="w-8 h-full flex items-center justify-center text-[#52525B] hover:text-[#18181B] border-r border-[#ECECE8]"
            >
              <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <span className="px-2.5 text-xs font-mono font-medium tabular-nums text-[#18181B]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in map"
              className="w-8 h-full flex items-center justify-center text-[#52525B] hover:text-[#18181B] border-l border-[#ECECE8]"
            >
              <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              aria-label="Reset map zoom and pan"
              className="px-2.5 h-full text-xs font-medium text-[#52525B] hover:text-[#18181B] border-l border-[#ECECE8] flex items-center gap-1"
            >
              <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional Layer Toggle Toolbar */}
      {showLayerToolbar && onToggleLayer && (
        <div
          role="region"
          aria-label="Digital twin visualization layers"
          className="px-4 py-2 border-b border-[#ECECE8] bg-[#F7F7F4] flex flex-wrap items-center gap-1.5"
        >
          <span className="text-xs font-medium text-[#52525B] inline-flex items-center gap-1.5 mr-1">
            <Layers
              className="w-3.5 h-3.5 text-[#52525B]"
              aria-hidden="true"
            />
            <span>Layers:</span>
          </span>
          {layerDefinitions.map((layer) => {
            const active = layers[layer.key];
            return (
              <button
                key={layer.key}
                type="button"
                onClick={() => onToggleLayer(layer.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 h-7 rounded-lg text-xs font-medium border transition-colors ${
                  active
                    ? "bg-white text-[#18181B] border-[#18181B] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    : "bg-white/60 text-[#71717A] border-[#E2E2DE] hover:text-[#18181B]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active ? "bg-[#18181B]" : "bg-[#D4D4CE]"
                  }`}
                  aria-hidden="true"
                />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Schematic Viewport */}
      <div className="relative bg-[#F7F7F4] overflow-hidden select-none">
        <svg
          viewBox="0 0 1000 540"
          role="img"
          aria-label={`Interactive facility schematic map for ${facilityName}`}
          className="w-full h-auto max-h-[520px] block"
        >
          <defs>
            <pattern
              id="cad-grid"
              width="25"
              height="25"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 25 0 L 0 0 0 25"
                fill="none"
                stroke="#EAEAE4"
                strokeWidth="0.75"
              />
            </pattern>
            <marker
              id="arrow-recommended"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#16A34A" />
            </marker>
            <marker
              id="arrow-alternative"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
            </marker>
            <marker
              id="arrow-blocked"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#C84B28" />
            </marker>

            {/* Clean Radial Gradients for Hazard Plumes */}
            <radialGradient id="plume-critical" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C84B28" stopOpacity="0.22" />
              <stop offset="65%" stopColor="#C84B28" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#C84B28" stopOpacity="0.02" />
            </radialGradient>
            <radialGradient id="plume-warning" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.20" />
              <stop offset="65%" stopColor="#D97706" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.02" />
            </radialGradient>
            <radialGradient id="plume-smoke" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#71717A" stopOpacity="0.20" />
              <stop offset="65%" stopColor="#71717A" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#71717A" stopOpacity="0.02" />
            </radialGradient>
          </defs>

          <g
            transform={
              viewMode === "3d"
                ? `translate(${pan.x + 500}, ${pan.y + 270}) scale(${zoom}) scale(1, 0.84) rotate(-5) translate(-500, -270)`
                : `translate(${pan.x + 500 * (1 - zoom)}, ${
                    pan.y + 270 * (1 - zoom)
                  }) scale(${zoom})`
            }
          >
            {/* Layer 1: Depot Perimeter Sheet & Architectural Grid */}
            <rect
              x="20"
              y="18"
              width="960"
              height="504"
              rx="16"
              fill="#FFFFFF"
              stroke="#E2E2DE"
              strokeWidth="1.5"
            />
            <rect
              x="21"
              y="19"
              width="958"
              height="502"
              rx="15"
              fill="url(#cad-grid)"
            />

            {/* Layer 1B: Orthogonal Internal Service Road Network */}
            <path
              d="M 82 132 L 124 132 L 124 304 L 825 304 M 370 304 L 370 472 L 825 472 L 825 215 L 885 215"
              fill="none"
              stroke="#F2F2EE"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 82 132 L 124 132 L 124 304 L 825 304 M 370 304 L 370 472 L 825 472 L 825 215 L 885 215"
              fill="none"
              stroke="#DCDBD4"
              strokeWidth="1.2"
              strokeDasharray="5 5"
            />

            {/* Layer 1C: North Tank Farm Secondary Containment Bund (Aligned x=170..770) */}
            <rect
              x="170"
              y="56"
              width="600"
              height="152"
              rx="10"
              fill="#F8F8F5"
              stroke="#D0CEC6"
              strokeWidth="1.5"
            />
            <rect
              x="174"
              y="60"
              width="592"
              height="144"
              rx="8"
              fill="none"
              stroke="#E2E2DE"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x="756"
              y="74"
              textAnchor="end"
              fill="#71717A"
              fontSize="8.5"
              fontWeight="700"
              fontFamily="monospace"
            >
              NORTH TANK FARM BUND
            </text>

            {/* Layer 2: Soft Radial Hazard Plumes (Rendered behind assets so labels are never obscured) */}
            {visibleHazards.map((hz) => {
              const isSelected = selectedHazard?.id === hz.id;
              const stroke =
                hz.type === "gas" || hz.type === "fire"
                  ? "#C84B28"
                  : hz.type === "smoke"
                  ? "#71717A"
                  : "#D97706";
              const fillUrl =
                hz.type === "gas" || hz.type === "fire"
                  ? "url(#plume-critical)"
                  : hz.type === "smoke"
                  ? "url(#plume-smoke)"
                  : "url(#plume-warning)";

              return (
                <g
                  key={hz.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Hazard zone ${hz.name}, severity ${hz.severity}`}
                  onClick={() => {
                    clearSelection();
                    setSelectedHazard(hz);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      clearSelection();
                      setSelectedHazard(hz);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <circle
                    cx={hz.x}
                    cy={hz.y}
                    r={hz.radius}
                    fill={fillUrl}
                    stroke={stroke}
                    strokeWidth={isSelected ? 2.2 : 1.25}
                    strokeDasharray="5 4"
                    strokeOpacity="0.65"
                  />
                  <circle
                    cx={hz.x}
                    cy={hz.y}
                    r={Math.max(14, hz.radius * 0.42)}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="1.5"
                    className="animate-radar-wave"
                    opacity="0.75"
                  />
                  <circle
                    cx={hz.x}
                    cy={hz.y}
                    r={Math.max(14, hz.radius * 0.42)}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    strokeOpacity="0.4"
                  />
                </g>
              );
            })}

            {/* Layer 3: Orthogonal Evacuation Routes (Along Road Channels) */}
            {layers.routes &&
              routes.map((route) => {
                const pointsAttr = route.waypoints
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ");
                const isSelected = selectedRouteId === route.id;
                const strokeColor =
                  route.status === "recommended"
                    ? "#16A34A"
                    : route.status === "alternative"
                    ? "#D97706"
                    : "#C84B28";
                const dashArray =
                  route.status === "recommended"
                    ? undefined
                    : route.status === "alternative"
                    ? "8 5"
                    : "4 5";
                const markerEnd =
                  route.status === "recommended"
                    ? "url(#arrow-recommended)"
                    : route.status === "alternative"
                    ? "url(#arrow-alternative)"
                    : "url(#arrow-blocked)";

                return (
                  <g
                    key={route.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${route.name}, status ${route.status}, risk score ${route.riskScore}`}
                    onClick={() => onSelectRoute?.(route.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectRoute?.(route.id);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <polyline
                      points={pointsAttr}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 8 : 6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.95"
                    />
                    <polyline
                      points={pointsAttr}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={
                        route.status === "recommended"
                          ? isSelected
                            ? 4
                            : 3.25
                          : isSelected
                          ? 3.5
                          : 2.5
                      }
                      strokeDasharray={dashArray}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd={markerEnd}
                    />
                    {route.status === "recommended" && (
                      <polyline
                        points={pointsAttr}
                        fill="none"
                        stroke="#86EFAC"
                        strokeWidth="2"
                        strokeDasharray="6 12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-route-flow pointer-events-none"
                      />
                    )}
                  </g>
                );
              })}

            {/* Layer 4: Facility Assets (Aligned Storage Tanks, Pipe Manifold, Gantry Bays, Buildings) */}
            {layers.assets &&
              assets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                const statusColor =
                  asset.riskStatus === "critical"
                    ? "#C84B28"
                    : asset.riskStatus === "high" ||
                      asset.riskStatus === "moderate"
                    ? "#D97706"
                    : "#16A34A";

                if (asset.shape === "circle") {
                  const r = asset.radius ?? 42;
                  const cy =
                    viewMode === "3d" && asset.category === "tank"
                      ? asset.y - 10
                      : asset.y;
                  const isAssembly = asset.category === "assembly_point";

                  return (
                    <g
                      key={asset.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`${asset.name} (${asset.code}), status ${asset.riskStatus}`}
                      onClick={() => {
                        clearSelection();
                        setSelectedAsset(asset);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          clearSelection();
                          setSelectedAsset(asset);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {viewMode === "3d" && asset.category === "tank" && (
                        <>
                          <ellipse
                            cx={asset.x}
                            cy={asset.y + 12}
                            rx={r}
                            ry={r * 0.85}
                            fill="#E2E2DE"
                            stroke="#A1A19A"
                            strokeWidth="1.2"
                          />
                          <rect
                            x={asset.x - r}
                            y={asset.y - 10}
                            width={r * 2}
                            height={22}
                            fill="#ECECE8"
                            stroke="#A1A19A"
                            strokeWidth="1.2"
                          />
                        </>
                      )}

                      <circle
                        cx={asset.x}
                        cy={cy}
                        r={r}
                        fill={isAssembly ? "#FFFFFF" : "#F3F3EF"}
                        stroke={
                          isSelected
                            ? "#18181B"
                            : isAssembly
                            ? "#16A34A"
                            : "#C4C0B6"
                        }
                        strokeWidth={isSelected ? 2.5 : isAssembly ? 2 : 1.5}
                      />

                      <circle
                        cx={asset.x}
                        cy={cy}
                        r={isAssembly ? r - 5 : r - 8}
                        fill="#FFFFFF"
                        stroke={isAssembly ? "#BBF7D0" : "#E2E2DE"}
                        strokeWidth="1"
                      />

                      {!isAssembly && (
                        <circle
                          cx={asset.x + r * 0.64}
                          cy={cy - r * 0.64}
                          r="4.5"
                          fill={statusColor}
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                      )}

                      <text
                        x={asset.x}
                        y={cy - 2}
                        textAnchor="middle"
                        fill="#18181B"
                        fontSize={isAssembly ? "9" : "10.5"}
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {asset.code}
                      </text>
                      <text
                        x={asset.x}
                        y={cy + 10}
                        textAnchor="middle"
                        fill={isAssembly ? "#15803D" : "#71717A"}
                        fontSize="8"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        {isAssembly
                          ? "MUSTER"
                          : `${asset.workersPresent} PERS`}
                      </text>
                    </g>
                  );
                }

                // Rectangular Assets: Emergency Exits, Pipe Manifold, Gantry Bays, VRU, Operations Building
                const isExit = asset.category === "emergency_exit";
                const isPipe = asset.category === "pipe_corridor";
                const w = isExit ? 68 : asset.width ?? 180;
                const h = isExit ? 40 : asset.height ?? 72;
                const rx =
                  asset.code === "EX-W1"
                    ? 34
                    : asset.code === "EX-S2"
                    ? 848
                    : asset.x;
                const ry = asset.y;

                return (
                  <g
                    key={asset.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${asset.name} (${asset.code}), status ${asset.riskStatus}`}
                    onClick={() => {
                      clearSelection();
                      setSelectedAsset(asset);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        clearSelection();
                        setSelectedAsset(asset);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {viewMode === "3d" && (
                      <rect
                        x={rx + 4}
                        y={ry + 6}
                        width={w}
                        height={h}
                        rx="8"
                        fill="#E2E2DE"
                      />
                    )}

                    <rect
                      x={rx}
                      y={ry}
                      width={w}
                      height={h}
                      rx="8"
                      fill="#FFFFFF"
                      stroke={isSelected ? "#18181B" : "#C4C0B6"}
                      strokeWidth={isSelected ? 2.2 : 1.4}
                    />

                    {isExit ? (
                      <>
                        <rect
                          x={rx + 3}
                          y={ry + 3}
                          width={w - 6}
                          height={h - 6}
                          rx="5"
                          fill="#F7F7F4"
                          stroke="#E2E2DE"
                          strokeWidth="1"
                        />
                        <text
                          x={rx + w / 2}
                          y={ry + 17}
                          textAnchor="middle"
                          fill="#18181B"
                          fontSize="9.5"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {asset.code}
                        </text>
                        <text
                          x={rx + w / 2}
                          y={ry + 29}
                          textAnchor="middle"
                          fill="#15803D"
                          fontSize="7.5"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          EXIT GATE
                        </text>
                      </>
                    ) : isPipe ? (
                      <>
                        <rect
                          x={rx + 4}
                          y={ry + 4}
                          width={w - 8}
                          height={h - 8}
                          rx="5"
                          fill="#F8F8F5"
                          stroke="#E2E2DE"
                          strokeWidth="1"
                        />
                        <circle
                          cx={rx + 18}
                          cy={ry + h / 2}
                          r="4"
                          fill={statusColor}
                        />
                        <text
                          x={rx + 28}
                          y={ry + h / 2 + 3.5}
                          fill="#18181B"
                          fontSize="9.5"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {asset.code} · {getShortAssetLabel(asset)}
                        </text>
                        <text
                          x={rx + w - 16}
                          y={ry + h / 2 + 3.5}
                          textAnchor="end"
                          fill="#52525B"
                          fontSize="9"
                          fontWeight="600"
                          fontFamily="monospace"
                        >
                          {asset.workersPresent} PERS IN ZONE
                        </text>
                      </>
                    ) : (
                      <>
                        <rect
                          x={rx + 1}
                          y={ry + 1}
                          width={w - 2}
                          height="22"
                          rx="7"
                          fill="#F7F7F4"
                        />
                        <line
                          x1={rx}
                          y1={ry + 23}
                          x2={rx + w}
                          y2={ry + 23}
                          stroke="#E2E2DE"
                          strokeWidth="1"
                        />
                        <circle
                          cx={rx + 12}
                          cy={ry + 12}
                          r="3.5"
                          fill={statusColor}
                        />
                        <text
                          x={rx + 21}
                          y={ry + 15.5}
                          fill="#18181B"
                          fontSize="9"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {asset.code} · {getShortAssetLabel(asset)}
                        </text>
                        <text
                          x={rx + 12}
                          y={ry + 42}
                          fill="#52525B"
                          fontSize="9.5"
                          fontWeight="500"
                        >
                          {asset.capacityOrSpec}
                        </text>
                        <text
                          x={rx + 12}
                          y={ry + 58}
                          fill="#71717A"
                          fontSize="8.5"
                          fontFamily="monospace"
                        >
                          Occupancy: {asset.workersPresent} personnel
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

            {/* Layer 5: Route Callout Pills (Positioned on Orthogonal Corridors) */}
            {layers.routes &&
              routes.map((route) => {
                const pt = getRoutePillAnchor(route);
                const dotColor =
                  route.status === "recommended"
                    ? "#16A34A"
                    : route.status === "alternative"
                    ? "#D97706"
                    : "#C84B28";
                const statusShort =
                  route.status === "recommended"
                    ? "REC"
                    : route.status === "alternative"
                    ? "ALT"
                    : "BLK";

                return (
                  <g
                    key={`${route.id}-pill`}
                    transform={`translate(${pt.x - 48}, ${pt.y - 10})`}
                    onClick={() => onSelectRoute?.(route.id)}
                    className="cursor-pointer"
                  >
                    <rect
                      x="0"
                      y="0"
                      width="96"
                      height="20"
                      rx="10"
                      fill="#FFFFFF"
                      stroke={dotColor}
                      strokeWidth="1.5"
                    />
                    <circle cx="11" cy="10" r="3" fill={dotColor} />
                    <text
                      x="19"
                      y="13.5"
                      fill="#18181B"
                      fontSize="8.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {route.shortCode} · {statusShort}
                    </text>
                  </g>
                );
              })}

            {/* Layer 6: Worker Agent Beacons (Positioned Strictly Along Road Corridors) */}
            {layers.workers &&
              workers.map((w) => {
                const fill =
                  w.status === "affected"
                    ? "#C84B28"
                    : w.status === "evacuated"
                    ? "#16A34A"
                    : "#2563EB";
                return (
                  <g key={w.id} transform={`translate(${w.x}, ${w.y})`}>
                    <title>{`${w.id}: ${w.label} (${w.status})`}</title>
                    <circle
                      r="4.5"
                      fill={fill}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}

            {/* Layer 7: Compact IoT Sensor Micro-Badges (68x18px at Aligned Perimeter Coordinates) */}
            {visibleSensors.map((sensor) => {
              const isSelected = selectedSensor?.id === sensor.id;
              const dotColor =
                sensor.status === "critical"
                  ? "#C84B28"
                  : sensor.status === "warning"
                  ? "#D97706"
                  : sensor.status === "offline"
                  ? "#71717A"
                  : "#16A34A";
              const valText = formatCompactSensorValue(sensor);

              return (
                <g
                  key={sensor.id}
                  transform={`translate(${sensor.x}, ${sensor.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Sensor ${sensor.name} at ${sensor.location}: ${sensor.value} ${sensor.unit} (${sensor.status})`}
                  onClick={() => {
                    clearSelection();
                    setSelectedSensor(sensor);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      clearSelection();
                      setSelectedSensor(sensor);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x="-36"
                    y="-9"
                    width="72"
                    height="18"
                    rx="9"
                    fill="#FFFFFF"
                    stroke={
                      isSelected
                        ? "#18181B"
                        : sensor.status === "critical"
                        ? "#C84B28"
                        : "#E2E2DE"
                    }
                    strokeWidth={isSelected ? 1.8 : 1.2}
                  />
                  <circle cx="-26" cy="0" r="3" fill={dotColor} />
                  <text
                    x="-19"
                    y="3"
                    fill="#18181B"
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {valText}
                  </text>
                </g>
              );
            })}

            {/* Wind Compass Rose in Top-Right Corner */}
            {layers.wind && (
              <g transform="translate(808, 36)">
                <rect
                  x="0"
                  y="0"
                  width="152"
                  height="50"
                  rx="10"
                  fill="#FFFFFF"
                  stroke="#E2E2DE"
                  strokeWidth="1.25"
                />
                <text
                  x="12"
                  y="18"
                  fill="#71717A"
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  PLUME DRIFT VECTOR
                </text>
                <text
                  x="12"
                  y="35"
                  fill="#18181B"
                  fontSize="10.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {windSpeedMps} m/s {windDirectionLabel.split(" ")[0]}
                </text>
                <g
                  transform={`translate(126, 25) rotate(${
                    windDirectionDeg - 90
                  })`}
                >
                  <circle
                    r="12"
                    fill="#F7F7F4"
                    stroke="#E2E2DE"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M -5 0 L 4 0 M 1 -3.5 L 5 0 L 1 3.5"
                    stroke="#18181B"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
              </g>
            )}

            {/* Focused Alert Target Ring */}
            {focusPoint && (
              <g transform={`translate(${focusPoint.x}, ${focusPoint.y})`}>
                <circle
                  r="28"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                />
                <rect
                  x="-70"
                  y="-46"
                  width="140"
                  height="19"
                  rx="6"
                  fill="#18181B"
                />
                <text
                  x="0"
                  y="-33.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  FOCUS: {focusPoint.label.slice(0, 18)}
                </text>
              </g>
            )}

            {/* Perimeter Footer Watermark */}
            <text
              x="38"
              y="508"
              fill="#71717A"
              fontSize="9"
              fontFamily="monospace"
            >
              DOWNSTREAM ENERGY DEPOT DIGITAL TWIN SCHEMATIC · {facilityCode}
            </text>
          </g>
        </svg>
      </div>

      {/* Live IoT Sensor & Hazard Telemetry Bar (Zero-Clutter Interactive Strip) */}
      <div className="px-4 py-2.5 bg-[#F7F7F4] border-t border-[#ECECE8] flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#71717A] mr-1">
          Nodes:
        </span>
        {visibleSensors.map((sensor) => {
          const isSelected = selectedSensor?.id === sensor.id;
          const shortId = sensor.id.replace("SNS-", "").replace("B-", "");
          const dotClass =
            sensor.status === "critical"
              ? "bg-[#C84B28]"
              : sensor.status === "warning"
              ? "bg-[#D97706]"
              : sensor.status === "offline"
              ? "bg-[#71717A]"
              : "bg-[#16A34A]";

          return (
            <button
              key={sensor.id}
              type="button"
              onClick={() => {
                clearSelection();
                setSelectedSensor(sensor);
              }}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono transition-colors border ${
                isSelected
                  ? "bg-[#18181B] text-white border-[#18181B]"
                  : "bg-white text-[#18181B] border-[#E2E2DE] hover:border-[#18181B]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${dotClass}`}
                aria-hidden="true"
              />
              <span className="font-semibold">{shortId}</span>
              <span
                className={isSelected ? "text-[#D4D4CE]" : "text-[#52525B]"}
              >
                {formatCompactSensorValue(sensor)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contextual Selection Inspector Drawer (if Asset, Sensor, or Hazard is clicked) */}
      {(selectedAsset || selectedSensor || selectedHazard) && (
        <div
          role="region"
          aria-label="Selected map item details"
          className="px-4 py-3.5 bg-white border-t border-[#E2E2DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          {selectedAsset && (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold text-[#52525B]">
                  {selectedAsset.code}
                </span>
                <span className="text-sm font-semibold text-[#18181B]">
                  {selectedAsset.name}
                </span>
                <RiskBadge level={selectedAsset.riskStatus} />
              </div>
              <p className="text-xs text-[#52525B]">
                {selectedAsset.description} · Spec:{" "}
                <strong className="text-[#18181B]">
                  {selectedAsset.capacityOrSpec}
                </strong>{" "}
                · Personnel in zone:{" "}
                <strong className="text-[#18181B]">
                  {selectedAsset.workersPresent}
                </strong>
              </p>
            </div>
          )}

          {selectedSensor && (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold text-[#52525B]">
                  {selectedSensor.id}
                </span>
                <span className="text-sm font-semibold text-[#18181B]">
                  {selectedSensor.name} ({selectedSensor.location})
                </span>
                <SensorStatusBadge status={selectedSensor.status} />
              </div>
              <p className="text-xs text-[#52525B] font-mono">
                Reading:{" "}
                <strong className="text-[#18181B]">
                  {selectedSensor.value} {selectedSensor.unit}
                </strong>{" "}
                · Warning: {selectedSensor.warningThreshold}{" "}
                {selectedSensor.unit} · Critical:{" "}
                {selectedSensor.criticalThreshold} {selectedSensor.unit} ·
                Updated: {selectedSensor.lastUpdated}
              </p>
            </div>
          )}

          {selectedHazard && (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold text-[#C84B28]">
                  {selectedHazard.id}
                </span>
                <span className="text-sm font-semibold text-[#18181B]">
                  {selectedHazard.name}
                </span>
                <RiskBadge level={selectedHazard.severity} />
              </div>
              <p className="text-xs text-[#52525B]">
                {selectedHazard.description} · Zone:{" "}
                <strong className="text-[#18181B]">
                  {selectedHazard.affectedArea}
                </strong>{" "}
                · Radius:{" "}
                <strong className="text-[#18181B]">
                  {selectedHazard.radius} m
                </strong>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={clearSelection}
            className="px-3 py-1.5 h-8 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE] text-xs font-medium text-[#18181B] hover:bg-[#EFEFEA] shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Map Legend */}
      <div className="px-4 py-2.5 border-t border-[#E2E2DE] bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-[#52525B]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#18181B]">
            <span className="w-4 h-1 bg-[#16A34A] inline-block rounded-full" />
            <span>Recommended Route</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-[#18181B]">
            <span className="w-4 h-1 bg-[#D97706] inline-block rounded-full" />
            <span>Alternative Route</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-[#18181B]">
            <span className="w-4 h-1 bg-[#C84B28] inline-block rounded-full" />
            <span>Blocked Route</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#16A34A] inline-block" />
            <span>Assembly Point (Safe Muster)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#C84B28] inline-block" />
            <span>Hazard Contour (% LEL / °C / ppm)</span>
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#71717A]">
          Click any tank, building, sensor node, or route to inspect
        </span>
      </div>
    </div>
  );
}
