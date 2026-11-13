"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Box,
  Compass,
  Crosshair,
  Eye,
  Flame,
  Layers,
  Navigation,
  RotateCcw,
  ShieldCheck,
  Thermometer,
  Wind,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  CameraRequest,
  DepotSceneCanvas,
  ZoomRequest,
} from "./DepotSceneCanvas";
import {
  ALL_TWIN_ENTITIES,
  CAMERA_PRESETS,
  CameraPresetId,
  DEPOT_FACILITIES,
  DEPOT_TANKS,
  TWIN_SCENARIOS,
  TWIN_SENSORS,
  TwinScenarioId,
  TwinSensorType,
  TwinStatus,
  getAssetStatus,
  getSensorReading,
} from "./depot-twin-data";
import {
  ROUTE_STATUS_COLORS,
  SENSOR_TYPE_COLORS,
} from "./TelemetryAndRoutes3D";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SCENARIO_LIST: TwinScenarioId[] = [
  "normal",
  "gas-leak",
  "fire",
  "smoke",
  "gas-wind",
];

const SENSOR_LABELS: Record<
  TwinSensorType,
  { name: string; param: string; swatchClass: string }
> = {
  gas: {
    name: "Gas Detector",
    param: "Hydrocarbon concentration (% LEL)",
    swatchClass: "bg-yellow-500",
  },
  temperature: {
    name: "Temperature Sensor",
    param: "Ambient & seal temperature (deg C)",
    swatchClass: "bg-orange-500",
  },
  smoke: {
    name: "Smoke Detector",
    param: "Optical smoke particulate (ppm)",
    swatchClass: "bg-slate-500",
  },
  fire: {
    name: "Flame Detector",
    param: "UV/IR flame radiation index",
    swatchClass: "bg-red-500",
  },
  wind: {
    name: "Wind Sensor",
    param: "Wind speed (m/s) & vector direction",
    swatchClass: "bg-cyan-500",
  },
};

function statusToBadgeVariant(
  status: TwinStatus
): "safe" | "warning" | "critical" {
  if (status === "Critical") return "critical";
  if (status === "Warning") return "warning";
  return "safe";
}

export function InteractiveDigitalTwinSection() {
  const [scenarioId, setScenarioId] = useState<TwinScenarioId>("normal");
  const [activePreset, setActivePreset] = useState<CameraPresetId>("overview");
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(
    "T-102"
  );
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);
  const [hoveredSensorId, setHoveredSensorId] = useState<string | null>(null);

  const [showSensors, setShowSensors] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [directoryTab, setDirectoryTab] = useState<
    "tanks" | "facilities" | "sensors"
  >("tanks");

  const [cameraRequest, setCameraRequest] = useState<CameraRequest | null>(
    null
  );
  const [zoomRequest, setZoomRequest] = useState<ZoomRequest | null>(null);

  const scenario = TWIN_SCENARIOS[scenarioId];

  const handleSelectScenario = (id: TwinScenarioId) => {
    setScenarioId(id);
    // Automatically highlight key impacted asset/sensor for immediate context while allowing free clicks
    if (id === "gas-leak") {
      setSelectedSensorId("SNS-GAS-02");
      setSelectedObjectId(null);
    } else if (id === "fire") {
      setSelectedObjectId("T-102");
      setSelectedSensorId(null);
    } else if (id === "smoke") {
      setSelectedObjectId("LOAD-GANTRY");
      setSelectedSensorId(null);
    } else if (id === "gas-wind") {
      setSelectedSensorId("SNS-GAS-04");
      setSelectedObjectId(null);
    }
  };

  const triggerPresetCamera = (presetId: CameraPresetId) => {
    const preset = CAMERA_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePreset(presetId);
    setCameraRequest({
      id: Date.now() + Math.random(),
      position: preset.position,
      target: preset.target,
    });
  };

  const triggerZoom = (direction: "in" | "out") => {
    setZoomRequest({
      id: Date.now() + Math.random(),
      direction,
    });
  };

  const focusOnPoint = (pos: [number, number, number]) => {
    setCameraRequest({
      id: Date.now() + Math.random(),
      position: [pos[0] + 10.5, Math.max(pos[1], 1) + 9.5, pos[2] + 10.5],
      target: [pos[0], Math.max(pos[1] * 0.5, 0.5), pos[2]],
    });
  };

  const handleSelectObject = (id: string) => {
    setSelectedObjectId(id);
    setSelectedSensorId(null);
  };

  const handleSelectSensor = (id: string) => {
    setSelectedSensorId(id);
    setSelectedObjectId(null);
  };

  const selectedEntity = useMemo(
    () => ALL_TWIN_ENTITIES.find((e) => e.id === selectedObjectId) ?? null,
    [selectedObjectId]
  );

  const selectedSensor = useMemo(
    () => TWIN_SENSORS.find((s) => s.id === selectedSensorId) ?? null,
    [selectedSensorId]
  );

  const monitoringSummary = useMemo(() => {
    let normal = 0;
    let warning = 0;
    let critical = 0;

    ALL_TWIN_ENTITIES.forEach((entity) => {
      const { status } = getAssetStatus(entity, scenario);
      if (status === "Critical") critical++;
      else if (status === "Warning") warning++;
      else normal++;
    });

    TWIN_SENSORS.forEach((sensor) => {
      const { status } = getSensorReading(sensor, scenario);
      if (status === "Critical") critical++;
      else if (status === "Warning") warning++;
      else normal++;
    });

    return { normal, warning, critical };
  }, [scenario]);

  return (
    <section className="space-y-5">
      {/* SECTION IDENTITY HEADER (C:/ti & C:/pkm clean architectural card, zero stacked pill eyebrows) */}
      <Card className="border-[#E2E8F0] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Interactive Digital Twin
            </h1>
            <p className="text-sm leading-relaxed text-[#64748B]">
              Explore a real-time virtual representation of the energy depot,
              monitor environmental conditions, identify potential hazards, and
              visualize adaptive evacuation routes through the EVORA ecosystem.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs lg:min-w-[300px] lg:max-w-sm">
            <div className="flex items-center justify-between gap-2 font-semibold text-[#0F172A]">
              <span className="inline-flex items-center gap-1.5">
                <Box className="h-3.5 w-3.5 text-[#4B6BFB]" aria-hidden="true" />
                <span>EVORA Digital Twin</span>
              </span>
              <span className="font-mono text-[11px] font-medium text-[#64748B]">
                Simulation Environment
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-[#E2E8F0] pt-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#047857]">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" aria-hidden="true" />
                System Status: Operational (demonstration mode)
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px] text-[#475569]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Wind className="h-3.5 w-3.5 text-[#4B6BFB]" aria-hidden="true" />
                Wind: {scenario.windDirectionLabel}
              </span>
            </div>
          </div>
        </div>

        {/* HAZARD SIMULATION SCENARIO SELECTOR */}
        <div className="mt-5 border-t border-[#E2E8F0] pt-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Hazard &amp; Evacuation Scenario
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SCENARIO_LIST.map((id) => {
                const cfg = TWIN_SCENARIOS[id];
                const isActive = scenarioId === id;
                const isEmergency = id !== "normal";
                return (
                  <Button
                    key={id}
                    size="sm"
                    variant={isActive ? (isEmergency ? "destructive" : "primary") : "outline"}
                    onClick={() => handleSelectScenario(id)}
                    className="h-8 text-xs font-medium"
                  >
                    {cfg.name}
                  </Button>
                );
              })}
            </div>
          </div>

          <div
            className={`mt-3 flex flex-col gap-2 rounded-[10px] border px-3.5 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between ${
              scenario.id === "normal"
                ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
                : "border-amber-200 bg-amber-50/70 text-[#0F172A]"
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-semibold">
                {scenario.id === "normal" ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
                )}
                <span>{scenario.incidentLocation}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#475569]">
                {scenario.summary}
              </p>
            </div>
            <Badge
              variant={
                scenario.severity === "Nominal"
                  ? "safe"
                  : scenario.severity === "Elevated"
                    ? "warning"
                    : "critical"
              }
              className="shrink-0 self-start sm:self-center"
            >
              Severity: {scenario.severity}
            </Badge>
          </div>
        </div>
      </Card>

      {/* MAIN 3D VIEWPORT + INSPECTOR GRID */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* LEFT: INTERACTIVE 3D ISOMETRIC VIEWPORT WITH DOCKED TOOLBAR */}
        <Card className="overflow-hidden border-[#E2E8F0] bg-white p-0 xl:col-span-8">
          {/* Docked Control Bar (Zero floating overlays obscuring the 3D depot) */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] bg-[#FAFBFC] px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-1">
              <span className="hidden items-center gap-1 pr-1.5 text-[11px] font-semibold text-[#64748B] sm:inline-flex">
                <Compass className="h-3.5 w-3.5 text-[#4B6BFB]" aria-hidden="true" />
                Camera:
              </span>
              {CAMERA_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => triggerPresetCamera(preset.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    activePreset === preset.id
                      ? "bg-[#0F172A] text-white"
                      : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                  }`}
                  title={preset.description}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <div className="flex flex-wrap items-center gap-1 border-r border-[#E2E8F0] pr-2">
                {[
                  {
                    key: "sensors",
                    label: "Sensors",
                    active: showSensors,
                    toggle: () => setShowSensors((v) => !v),
                  },
                  {
                    key: "hazards",
                    label: "Hazards",
                    active: showHazards,
                    toggle: () => setShowHazards((v) => !v),
                  },
                  {
                    key: "routes",
                    label: "Routes",
                    active: showRoutes,
                    toggle: () => setShowRoutes((v) => !v),
                  },
                  {
                    key: "labels",
                    label: "Labels",
                    active: showLabels,
                    toggle: () => setShowLabels((v) => !v),
                  },
                ].map((layer) => (
                  <button
                    key={layer.key}
                    type="button"
                    onClick={layer.toggle}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                      layer.active
                        ? "bg-[#EEF2FF] text-[#4B6BFB] border border-[#4B6BFB]/20"
                        : "text-[#64748B] hover:bg-[#F1F5F9] border border-transparent"
                    }`}
                  >
                    <Layers className="h-3 w-3" aria-hidden="true" />
                    {layer.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => triggerZoom("in")}
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => triggerZoom("out")}
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-[11px]"
                  onClick={() => triggerPresetCamera("overview")}
                  title="Reset Camera to Isometric Overview"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="relative h-[540px] w-full bg-[#F8FAFC] sm:h-[600px] lg:h-[650px]">
            <DepotSceneCanvas
              scenario={scenario}
              selectedObjectId={selectedObjectId}
              selectedSensorId={selectedSensorId}
              hoveredObjectId={hoveredObjectId}
              hoveredSensorId={hoveredSensorId}
              onSelectObject={handleSelectObject}
              onSelectSensor={handleSelectSensor}
              onHoverObject={setHoveredObjectId}
              onHoverSensor={setHoveredSensorId}
              onClearSelection={() => {
                setSelectedObjectId(null);
                setSelectedSensorId(null);
              }}
              cameraRequest={cameraRequest}
              zoomRequest={zoomRequest}
              showSensors={showSensors}
              showHazards={showHazards}
              showRoutes={showRoutes}
              showLabels={showLabels}
            />

            {/* Bottom-Left Compact Navigation Hint (clears AP-BRAVO) */}
            <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-lg border border-[#E2E8F0] bg-white/95 px-2.5 py-1 text-[11px] text-[#64748B] shadow-card">
              Drag: Orbit · Right-drag: Pan · Scroll: Zoom · Click asset to inspect
            </div>

            {/* Bottom-Right Wind & Plume Callout */}
            {scenario.hazards.length > 0 && (
              <div className="pointer-events-none absolute bottom-3 right-3 z-10 hidden max-w-xs rounded-lg border border-[#E2E8F0] bg-white/95 px-3 py-2 text-[11px] shadow-card md:block">
                <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                  <Wind className="h-3.5 w-3.5 text-[#4B6BFB]" aria-hidden="true" />
                  <span>{scenario.windDirectionLabel}</span>
                </div>
                <p className="mt-0.5 text-[10px] leading-snug text-[#64748B]">
                  {scenario.environmentalNote}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* RIGHT: INSPECTOR, FACILITY OVERVIEW & ADAPTIVE ROUTES */}
        <div className="flex flex-col gap-4 xl:col-span-4">
          {/* 1. SELECTED OBJECT / SENSOR INSPECTOR PANEL */}
          <Card className="border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  {selectedSensor
                    ? "Sensor Telemetry Inspector"
                    : selectedEntity
                      ? "Facility & Asset Inspector"
                      : "Depot Object Directory"}
                </h2>
              </div>
              {(selectedEntity || selectedSensor) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedObjectId(null);
                    setSelectedSensorId(null);
                  }}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-800"
                >
                  Browse All
                </button>
              )}
            </div>

            {selectedEntity ? (
              (() => {
                const assetEval = getAssetStatus(selectedEntity, scenario);
                const linkedSensors = TWIN_SENSORS.filter((s) =>
                  selectedEntity.sensorIds.includes(s.id)
                );

                return (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {selectedEntity.code} · {selectedEntity.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {selectedEntity.name}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {selectedEntity.zone} · {selectedEntity.productOrSpec}
                        </p>
                      </div>
                      <Badge variant={statusToBadgeVariant(assetEval.status)} dot>
                        {assetEval.status}
                      </Badge>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600">
                      {selectedEntity.description}
                    </p>

                    <div
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        assetEval.status === "Critical"
                          ? "border-red-200 bg-red-50/70 text-red-900"
                          : assetEval.status === "Warning"
                            ? "border-amber-200 bg-amber-50/70 text-amber-900"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="font-semibold">Hazard Status: </span>
                      {assetEval.hazardNote}
                    </div>

                    {/* Linked Sensors Quick Jump */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Associated Sensors ({linkedSensors.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {linkedSensors.map((sensor) => {
                          const reading = getSensorReading(sensor, scenario);
                          return (
                            <button
                              key={sensor.id}
                              type="button"
                              onClick={() => handleSelectSensor(sensor.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50"
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${SENSOR_LABELS[sensor.type].swatchClass}`}
                              />
                              <span className="font-mono">{sensor.code}</span>
                              <span className="text-slate-500">
                                {reading.value} {sensor.unit}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1.5 text-xs"
                      onClick={() => focusOnPoint(selectedEntity.position)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Focus Camera on {selectedEntity.code}
                    </Button>
                  </div>
                );
              })()
            ) : selectedSensor ? (
              (() => {
                const reading = getSensorReading(selectedSensor, scenario);
                const meta = SENSOR_LABELS[selectedSensor.type];
                return (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${meta.swatchClass}`}
                          />
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {selectedSensor.id} ({selectedSensor.code})
                          </span>
                        </div>
                        <h3 className="mt-0.5 text-sm font-bold text-slate-900">
                          {selectedSensor.name}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {meta.name} · {selectedSensor.installationArea}
                        </p>
                      </div>
                      <Badge variant={statusToBadgeVariant(reading.status)} dot>
                        {reading.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                        <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                          Simulated Reading
                        </div>
                        <div className="mt-0.5 font-mono text-lg font-bold text-slate-900">
                          {reading.value}{" "}
                          <span className="text-xs font-normal text-slate-500">
                            {selectedSensor.unit}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                        <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                          Alert Thresholds
                        </div>
                        <div className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                          <div>
                            Warn: {selectedSensor.warningThreshold}{" "}
                            {selectedSensor.unit}
                          </div>
                          <div>
                            Crit: {selectedSensor.criticalThreshold}{" "}
                            {selectedSensor.unit}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-1.5 text-[11px] text-slate-500">
                      <span>Parameter: {meta.param}</span>
                      <span className="font-mono">Demo · Live Sync</span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1.5 text-xs"
                      onClick={() => focusOnPoint(selectedSensor.position)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Focus Camera on {selectedSensor.code}
                    </Button>
                  </div>
                );
              })()
            ) : (
              /* Interactive Directory Browser when user clicks "Browse All" or empty ground */
              <div className="mt-3 space-y-2.5">
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 text-[11px] font-medium">
                  {(
                    [
                      ["tanks", `Tanks (${DEPOT_TANKS.length})`],
                      ["facilities", `Facilities (${DEPOT_FACILITIES.length})`],
                      ["sensors", `Sensors (${TWIN_SENSORS.length})`],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDirectoryTab(key)}
                      className={`rounded-md py-1 transition-colors ${
                        directoryTab === key
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                  {directoryTab === "tanks" &&
                    DEPOT_TANKS.map((tank) => {
                      const st = getAssetStatus(tank, scenario).status;
                      return (
                        <button
                          key={tank.id}
                          type="button"
                          onClick={() => handleSelectObject(tank.id)}
                          className="flex w-full items-center justify-between rounded-md border border-slate-100 px-2.5 py-1.5 text-left text-xs hover:border-blue-200 hover:bg-blue-50/50"
                        >
                          <span className="truncate font-medium text-slate-800">
                            <span className="font-mono text-blue-700">
                              {tank.code}
                            </span>{" "}
                            · {tank.name.replace(`Storage Tank ${tank.code} `, "")}
                          </span>
                          <Badge variant={statusToBadgeVariant(st)} className="ml-2 shrink-0">
                            {st}
                          </Badge>
                        </button>
                      );
                    })}

                  {directoryTab === "facilities" &&
                    DEPOT_FACILITIES.map((fac) => {
                      const st = getAssetStatus(fac, scenario).status;
                      return (
                        <button
                          key={fac.id}
                          type="button"
                          onClick={() => handleSelectObject(fac.id)}
                          className="flex w-full items-center justify-between rounded-md border border-slate-100 px-2.5 py-1.5 text-left text-xs hover:border-blue-200 hover:bg-blue-50/50"
                        >
                          <span className="truncate font-medium text-slate-800">
                            <span className="font-mono text-blue-700">
                              {fac.code}
                            </span>{" "}
                            · {fac.name}
                          </span>
                          <Badge variant={statusToBadgeVariant(st)} className="ml-2 shrink-0">
                            {st}
                          </Badge>
                        </button>
                      );
                    })}

                  {directoryTab === "sensors" &&
                    TWIN_SENSORS.map((sensor) => {
                      const r = getSensorReading(sensor, scenario);
                      return (
                        <button
                          key={sensor.id}
                          type="button"
                          onClick={() => handleSelectSensor(sensor.id)}
                          className="flex w-full items-center justify-between rounded-md border border-slate-100 px-2.5 py-1.5 text-left text-xs hover:border-blue-200 hover:bg-blue-50/50"
                        >
                          <span className="inline-flex items-center gap-1.5 truncate font-medium text-slate-800">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${SENSOR_LABELS[sensor.type].swatchClass}`}
                            />
                            <span className="font-mono">{sensor.code}</span>
                            <span className="text-slate-500">
                              {r.value} {sensor.unit}
                            </span>
                          </span>
                          <Badge variant={statusToBadgeVariant(r.status)} className="ml-2 shrink-0">
                            {r.status}
                          </Badge>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </Card>

          {/* 2. FACILITY OVERVIEW & MONITORING STATUS SUMMARY */}
          <Card className="border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Facility Overview & Status
              </h2>
              <Activity className="h-4 w-4 text-slate-400" />
            </div>

            <div className="mt-3 grid grid-cols-5 gap-1.5 text-center">
              {[
                { label: "Tanks", value: DEPOT_TANKS.length },
                { label: "Sensors", value: TWIN_SENSORS.length },
                { label: "Zones", value: 6 },
                { label: "Exits", value: 3 },
                { label: "Muster", value: 3 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 py-2"
                >
                  <div className="font-mono text-sm font-bold text-slate-900">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 px-2.5 py-1.5">
                <span className="font-medium text-emerald-800">Normal</span>
                <span className="font-mono font-bold text-emerald-700">
                  {monitoringSummary.normal}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/60 px-2.5 py-1.5">
                <span className="font-medium text-amber-800">Warning</span>
                <span className="font-mono font-bold text-amber-700">
                  {monitoringSummary.warning}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/60 px-2.5 py-1.5">
                <span className="font-medium text-red-800">Critical</span>
                <span className="font-mono font-bold text-red-700">
                  {monitoringSummary.critical}
                </span>
              </div>
            </div>
          </Card>

          {/* 3. ADAPTIVE EVACUATION ROUTES EVALUATION */}
          <Card className="border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Adaptive Evacuation Corridors
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">EVORA Graph</span>
            </div>

            <div className="mt-3 space-y-2">
              {scenario.recommendedRoutePaths.map((route) => {
                const badgeText =
                  route.status === "recommended"
                    ? "Recommended"
                    : route.status === "caution"
                      ? "Caution"
                      : route.status === "blocked"
                        ? "Blocked"
                        : "Normal";
                const variant =
                  route.status === "recommended"
                    ? "safe"
                    : route.status === "caution"
                      ? "warning"
                      : route.status === "blocked"
                        ? "critical"
                        : "outline";

                return (
                  <div
                    key={route.id}
                    className="rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        {route.label}
                      </span>
                      <Badge variant={variant} className="shrink-0">
                        {badgeText}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {route.originLabel} -&gt; {route.destinationLabel}
                      </span>
                      <span className="font-mono">
                        {route.distanceM}m · Risk {route.riskScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* COMPLETE MAP & TELEMETRY LEGEND */}
      <Card className="border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Digital Twin Spatial & Sensor Legend
            </h2>
            <p className="text-[11px] text-slate-500">
              Visual encoding across depot structures, EVORA IoT categories,
              simulated hazard zones, and dynamic egress corridors.
            </p>
          </div>
          <span className="text-[11px] text-slate-400">
            Conceptual hazard overlay & demonstration dataset
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 md:grid-cols-3">
          {/* Column 1: Depot Infrastructure */}
          <div className="space-y-2 text-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Depot Structures & Zones
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-slate-500 bg-slate-100" />
                <span>Storage Tanks (15)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm border border-sky-400 bg-sky-200" />
                <span>Loading Area</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm border border-slate-500 bg-slate-300" />
                <span>Pumping Station</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm border border-slate-400 bg-white" />
                <span>Control & Office</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm border border-orange-400 bg-orange-200" />
                <span>Tank Containment Bund</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm bg-emerald-600 text-[8px] font-bold text-white">
                  E
                </span>
                <span>Exits & Assembly Pts</span>
              </div>
            </div>
          </div>

          {/* Column 2: IoT Sensors */}
          <div className="space-y-2 text-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              EVORA IoT Sensor Markers
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              {(Object.keys(SENSOR_LABELS) as TwinSensorType[]).map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-black/15"
                    style={{ backgroundColor: SENSOR_TYPE_COLORS[type] }}
                  />
                  <span>{SENSOR_LABELS[type].name}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-blue-800 bg-blue-600" />
                <span>Worker Start Crews</span>
              </div>
            </div>
          </div>

          {/* Column 3: Hazard Zones & Routes */}
          <div className="space-y-2 text-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Hazards & Evacuation Route Colors
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-5 rounded-full"
                  style={{ backgroundColor: ROUTE_STATUS_COLORS.recommended }}
                />
                <span>Green · Recommended</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-5 rounded-full"
                  style={{ backgroundColor: ROUTE_STATUS_COLORS.caution }}
                />
                <span>Yellow · Caution</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-5 rounded-full"
                  style={{ backgroundColor: ROUTE_STATUS_COLORS.blocked }}
                />
                <span>Red · Blocked Hazard</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-5 rounded-full"
                  style={{ backgroundColor: ROUTE_STATUS_COLORS.normal }}
                />
                <span>Blue · Normal Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-red-500" />
                <span>Fire / Heat Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                <span>Gas / Smoke Plume</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
