"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Flame,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  StepForward,
  Users,
  Waypoints,
} from "lucide-react";
import { useEvora } from "@/lib/evora-context";
import {
  RiskBadge,
  RouteStatusBadge,
} from "@/components/shared/status-badge";
import { UIStateWrapper } from "@/components/shared/ui-state-wrapper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Point2D } from "@/types/evora";

function interpolateAlongWaypoints(
  waypoints: Point2D[],
  progress: number
): Point2D {
  if (waypoints.length === 0) return { x: 100, y: 100 };
  if (waypoints.length === 1 || progress <= 0) return waypoints[0];
  if (progress >= 1) return waypoints[waypoints.length - 1];

  const segments: { from: Point2D; to: Point2D; len: number }[] = [];
  let totalLen = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const len = Math.hypot(
      waypoints[i + 1].x - waypoints[i].x,
      waypoints[i + 1].y - waypoints[i].y
    );
    segments.push({ from: waypoints[i], to: waypoints[i + 1], len });
    totalLen += len;
  }

  let targetDist = progress * totalLen;
  for (const seg of segments) {
    if (targetDist <= seg.len || seg.len === 0) {
      const ratio = seg.len === 0 ? 0 : targetDist / seg.len;
      return {
        x: Math.round(seg.from.x + (seg.to.x - seg.from.x) * ratio),
        y: Math.round(seg.from.y + (seg.to.y - seg.from.y) * ratio),
      };
    }
    targetDist -= seg.len;
  }
  return waypoints[waypoints.length - 1];
}

export default function SimulationPage() {
  const {
    currentFacility,
    assets,
    hazards,
    routes,
    scenarios,
    applyScenarioPreset,
    triggerHazardExpansion,
    resetDemoState,
    hazardExpansionStep,
  } = useEvora();

  const [selectedScenarioId, setSelectedScenarioId] =
    useState<string>("SCN-GAS-01");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4>(1);
  const [simTickSeconds, setSimTickSeconds] = useState<number>(25);
  const [workerCount, setWorkerCount] = useState<number>(42);

  const activeScenario =
    scenarios.find((s) => s.id === selectedScenarioId) ?? scenarios[0];
  const recommendedRoute =
    routes.find((r) => r.status === "recommended") ?? routes[0];
  const alternativeRoute =
    routes.find((r) => r.status === "alternative") ?? recommendedRoute;

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(600 / simSpeed);
    const timer = window.setInterval(() => {
      setSimTickSeconds((prev) => {
        if (prev >= 210) {
          setIsPlaying(false);
          return 210;
        }
        return prev + 5;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, simSpeed]);

  // Deterministic virtual worker cohort positions derived from simTickSeconds and workerCount
  const simulatedAgents = useMemo(() => {
    const count = Math.max(12, Math.min(64, workerCount));
    const list = [];
    for (let i = 0; i < count; i++) {
      const responseDelay = (i % 6) * 4;
      const speedFactor = 0.85 + (i % 5) * 0.09;
      const effectiveElapsed = Math.max(0, simTickSeconds - responseDelay);
      const totalNeededSec = 175 / speedFactor;
      const progress = Math.min(1, effectiveElapsed / totalNeededSec);

      const usePrimary = i % 3 !== 2;
      const chosenRoute = usePrimary ? recommendedRoute : alternativeRoute;
      const basePos = interpolateAlongWaypoints(
        chosenRoute?.waypoints ?? [
          { x: 330, y: 365 },
          { x: 78, y: 115 },
        ],
        progress
      );

      const offsetAngle = (i * 137.5 * Math.PI) / 180;
      const offsetRadius = progress >= 1 ? (i % 4) * 5 : (i % 3) * 6;
      const x = Math.round(basePos.x + Math.cos(offsetAngle) * offsetRadius);
      const y = Math.round(basePos.y + Math.sin(offsetAngle) * offsetRadius);

      const inHazard = hazards.some(
        (h) =>
          h.active &&
          h.radius > 0 &&
          Math.hypot(x - h.x, y - h.y) <= h.radius * 0.95
      );

      const status: "evacuated" | "affected" | "waiting" | "moving" =
        progress >= 1
          ? "evacuated"
          : inHazard
          ? "affected"
          : effectiveElapsed === 0
          ? "waiting"
          : "moving";

      list.push({
        id: `AG-${(i + 1).toString().padStart(2, "0")}`,
        x,
        y,
        progress,
        status,
        routeCode: chosenRoute?.shortCode ?? "RT-A",
      });
    }
    return list;
  }, [
    alternativeRoute,
    hazards,
    recommendedRoute,
    simTickSeconds,
    workerCount,
  ]);

  const evacuatedCount = simulatedAgents.filter(
    (a) => a.status === "evacuated"
  ).length;
  const remainingCount = simulatedAgents.length - evacuatedCount;
  const affectedCount = simulatedAgents.filter(
    (a) => a.status === "affected"
  ).length;
  const movingCount = simulatedAgents.filter(
    (a) => a.status === "moving"
  ).length;
  const densityPersonsPerSqm = Number(
    (0.8 + (movingCount / Math.max(1, workerCount)) * 1.9).toFixed(2)
  );

  const handleScenarioChange = (scenId: string) => {
    setSelectedScenarioId(scenId);
    const scen = scenarios.find((s) => s.id === scenId);
    if (scen) {
      setWorkerCount(scen.defaultWorkerCount);
      setSimTickSeconds(25);
      setIsPlaying(false);
      applyScenarioPreset(scenId);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E2DE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" dot>
              Multi-Agent Engine
            </Badge>
            <span className="text-xs text-[#68686F]">
              · 4-Agent Coupled Simulation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
            Multi-Agent Simulation{" "}
            <span className="font-normal text-[#68686F]">#04</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#52525B] mt-1">
            Interactive simulation integrating Worker, Hazard, Safety, and
            Routing agents across selectable multi-hazard scenarios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="embossed"
            size="lg"
            onClick={() => {
              triggerHazardExpansion();
              if (simTickSeconds < 40) setSimTickSeconds(45);
            }}
          >
            <Flame className="w-3.5 h-3.5 text-[#C84B28]" aria-hidden="true" />
            <span>Trigger Hazard Event</span>
          </Button>
        </div>
      </div>

      <UIStateWrapper pageTitle="Hybrid Multi-Agent Simulation">
        {/* 6 Simulation Metrics Strip */}
        <section
          aria-label="Simulation live metrics"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5"
        >
          <Card className="p-4">
            <div className="text-xs font-medium text-[#68686F]">
              Workers Evacuated
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-[#18181B] mt-1.5">
              {evacuatedCount}{" "}
              <span className="text-xs font-normal text-[#68686F]">
                / {simulatedAgents.length}
              </span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-medium text-[#68686F]">
              Workers Remaining
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-[#18181B] mt-1.5">
              {remainingCount}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-medium text-[#68686F]">
              In Affected Zones
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-[#18181B] mt-1.5">
              {affectedCount}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-medium text-[#68686F]">
              Avg Evacuation Time
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-[#18181B] mt-1.5">
              {activeScenario.comparisonMetrics[2]?.evacuationTimeSec ?? 195}s
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-medium text-[#68686F]">
              Corridor Density
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-[#18181B] mt-1.5">
              {densityPersonsPerSqm} p/m2
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-medium text-[#68686F]">
              Route Safety Status
            </div>
            <div className="mt-1.5">
              {recommendedRoute ? (
                <RouteStatusBadge status={recommendedRoute.status} />
              ) : (
                <RouteStatusBadge status="blocked" />
              )}
            </div>
          </Card>
        </section>

        {/* Main Workspace: Top-Down Multi-Agent Simulation Canvas (8 cols) + Settings & 4-Agent Legend (4 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left 8 Cols: Simulation Canvas + Playback Bar */}
          <div className="xl:col-span-8 space-y-4">
            <div className="bg-surface border border-border-subtle rounded-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border-subtle bg-canvas flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface border border-border-subtle text-ink-primary">
                    SIM CLOCK: T+{simTickSeconds}s / 210s
                  </span>
                  <span className="text-sm font-bold text-ink-primary">
                    {activeScenario.name}
                  </span>
                </div>
                <RiskBadge level={activeScenario.severity} />
              </div>

              {/* Top-Down SVG Multi-Agent Simulation Canvas */}
              <div className="bg-[#F3F5F8]">
                <svg
                  viewBox="0 0 1000 520"
                  role="img"
                  aria-label="Multi-agent evacuation simulation canvas"
                  className="w-full h-auto block"
                >
                  <rect
                    x="24"
                    y="24"
                    width="952"
                    height="472"
                    rx="12"
                    fill="#FAFBFD"
                    stroke="#CBD5E1"
                    strokeWidth="2"
                  />

                  {/* Facility Structural Footprints */}
                  {assets.map((asset) => {
                    if (asset.shape === "circle") {
                      return (
                        <g key={asset.id}>
                          <circle
                            cx={asset.x}
                            cy={asset.y}
                            r={asset.radius ?? 45}
                            fill={
                              asset.category === "assembly_point"
                                ? "#E8F4F0"
                                : "#FFFFFF"
                            }
                            stroke={
                              asset.category === "assembly_point"
                                ? "#176B5B"
                                : "#94A3B8"
                            }
                            strokeWidth="2"
                          />
                          <text
                            x={asset.x}
                            y={asset.y + 4}
                            textAnchor="middle"
                            fill="#17212B"
                            fontSize="11"
                            fontWeight="700"
                            fontFamily="monospace"
                          >
                            {asset.code}
                          </text>
                        </g>
                      );
                    }
                    return (
                      <g key={asset.id}>
                        <rect
                          x={asset.x}
                          y={asset.y}
                          width={asset.width ?? 120}
                          height={asset.height ?? 60}
                          rx="6"
                          fill="#FFFFFF"
                          stroke="#94A3B8"
                          strokeWidth="1.8"
                        />
                        <text
                          x={asset.x + (asset.width ?? 120) / 2}
                          y={asset.y + (asset.height ?? 60) / 2 + 4}
                          textAnchor="middle"
                          fill="#475467"
                          fontSize="10.5"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {asset.code}
                        </text>
                      </g>
                    );
                  })}

                  {/* 2. Hazard Agents (Expanding Translucent Zones) */}
                  {hazards
                    .filter((h) => h.active && h.radius > 0)
                    .map((hz) => {
                      const dynamicRadius = Math.round(
                        hz.radius * (0.85 + (simTickSeconds / 210) * 0.25)
                      );
                      return (
                        <g key={hz.id}>
                          <circle
                            cx={hz.x}
                            cy={hz.y}
                            r={dynamicRadius}
                            fill="rgba(214, 69, 69, 0.18)"
                            stroke="#D64545"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                          />
                          <text
                            x={hz.x}
                            y={hz.y - dynamicRadius - 6}
                            textAnchor="middle"
                            fill="#A62626"
                            fontSize="10"
                            fontWeight="700"
                            fontFamily="monospace"
                          >
                            HAZARD AGENT: {hz.type.toUpperCase()} (R={dynamicRadius}m)
                          </text>
                        </g>
                      );
                    })}

                  {/* 3. Safety Agents & 4. Routing Agents Corridors */}
                  {routes.map((rt) => {
                    const pts = rt.waypoints
                      .map((p) => `${p.x},${p.y}`)
                      .join(" ");
                    const stroke =
                      rt.status === "recommended"
                        ? "#176B5B"
                        : rt.status === "alternative"
                        ? "#D98A19"
                        : "#D64545";
                    return (
                      <g key={rt.id}>
                        <polyline
                          points={pts}
                          fill="none"
                          stroke={stroke}
                          strokeWidth={rt.status === "recommended" ? 5 : 3}
                          strokeDasharray={
                            rt.status === "recommended" ? undefined : "7 5"
                          }
                        />
                        {/* Routing Agent Decision Node Marker */}
                        {rt.waypoints[1] && (
                          <g
                            transform={`translate(${rt.waypoints[1].x}, ${rt.waypoints[1].y})`}
                          >
                            <rect
                              x="-14"
                              y="-10"
                              width="28"
                              height="20"
                              rx="4"
                              fill="#FFFFFF"
                              stroke={stroke}
                              strokeWidth="2"
                            />
                            <text
                              x="0"
                              y="4"
                              textAnchor="middle"
                              fill="#17212B"
                              fontSize="8.5"
                              fontWeight="700"
                              fontFamily="monospace"
                            >
                              {rt.shortCode.replace("ROUTE ", "R")}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* 1. Worker Agents */}
                  {simulatedAgents.map((agent) => {
                    const fill =
                      agent.status === "evacuated"
                        ? "#176B5B"
                        : agent.status === "affected"
                        ? "#A62626"
                        : agent.status === "waiting"
                        ? "#D98A19"
                        : "#1D5B8F";
                    return (
                      <g
                        key={agent.id}
                        transform={`translate(${agent.x}, ${agent.y})`}
                      >
                        <circle
                          r="6.5"
                          fill={fill}
                          stroke="#FFFFFF"
                          strokeWidth="1.8"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Bottom Playback Controls & Timeline Scrubber */}
              <div className="p-4 border-t border-border-subtle bg-surface space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[42px] rounded-control bg-brand text-white text-xs font-semibold hover:bg-brand-hover"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" aria-hidden="true" />
                          <span>Pause Simulation</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" aria-hidden="true" />
                          <span>Play Simulation</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setSimTickSeconds((s) => Math.min(210, s + 15));
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[42px] rounded-control bg-canvas border border-border-control text-xs font-semibold text-ink-primary hover:bg-surface"
                    >
                      <StepForward className="w-4 h-4" aria-hidden="true" />
                      <span>Step +15s</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setSimTickSeconds(0);
                        resetDemoState();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[42px] rounded-control bg-canvas border border-border-control text-xs font-semibold text-ink-secondary hover:text-ink-primary"
                    >
                      <RotateCcw className="w-4 h-4" aria-hidden="true" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Speed Controls */}
                  <div
                    role="group"
                    aria-label="Simulation playback speed"
                    className="inline-flex items-center rounded-control border border-border-control bg-canvas p-0.5"
                  >
                    {([1, 2, 4] as const).map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setSimSpeed(spd)}
                        aria-pressed={simSpeed === spd}
                        className={`px-3 py-1.5 min-h-[34px] rounded text-xs font-mono font-bold ${
                          simSpeed === spd
                            ? "bg-surface text-ink-primary border border-border-subtle"
                            : "text-ink-secondary hover:text-ink-primary"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline Scrubber */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-ink-secondary mb-1">
                    <label htmlFor="sim-timeline-slider">
                      Simulation Progress Timeline (0s to 210s)
                    </label>
                    <span>
                      T+{simTickSeconds}s ({Math.round((evacuatedCount / simulatedAgents.length) * 100)}% Evacuated)
                    </span>
                  </div>
                  <input
                    id="sim-timeline-slider"
                    type="range"
                    min={0}
                    max={210}
                    step={5}
                    value={simTickSeconds}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setSimTickSeconds(Number(e.target.value));
                    }}
                    className="w-full accent-brand"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Scenario Configuration & 4-Agent Architecture Legend */}
          <div className="xl:col-span-4 space-y-4">
            {/* Scenario & Worker Cohort Controls */}
            <section
              aria-labelledby="sim-parameters-heading"
              className="bg-surface border border-border-subtle rounded-card p-5 space-y-4"
            >
              <h2
                id="sim-parameters-heading"
                className="text-base font-bold text-ink-primary"
              >
                Scenario & Agent Cohort Controls
              </h2>

              <div>
                <label
                  htmlFor="scenario-select-input"
                  className="block text-xs font-semibold text-ink-secondary mb-1.5"
                >
                  Select Multi-Hazard Scenario:
                </label>
                <select
                  id="scenario-select-input"
                  value={selectedScenarioId}
                  onChange={(e) => handleScenarioChange(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-ink-primary bg-canvas border border-border-control rounded-control px-3 py-2.5 min-h-[44px]"
                >
                  {scenarios.map((scen) => (
                    <option key={scen.id} value={scen.id}>
                      {scen.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                  {activeScenario.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border-subtle">
                <div className="flex justify-between text-xs font-semibold text-ink-primary mb-1">
                  <label htmlFor="worker-count-slider">
                    Virtual Worker Agent Count:
                  </label>
                  <span className="font-mono">{workerCount} Agents</span>
                </div>
                <input
                  id="worker-count-slider"
                  type="range"
                  min={16}
                  max={64}
                  step={2}
                  value={workerCount}
                  onChange={(e) => setWorkerCount(Number(e.target.value))}
                  className="w-full accent-brand"
                />
                <div className="flex justify-between text-[11px] font-mono text-ink-muted">
                  <span>16 (Night Shift)</span>
                  <span>42 (Standard)</span>
                  <span>64 (Peak Turnaround)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                <span className="text-ink-secondary font-medium">
                  Westward Plume State:
                </span>
                <span className="font-mono font-bold text-ink-primary">
                  {hazardExpansionStep > 0
                    ? "EXPANDED (Route A Blocked)"
                    : "BASELINE (Route A Clear)"}
                </span>
              </div>
            </section>

            {/* 4-Component Hybrid Multi-Agent Legend (From Proposal Abstract) */}
            <section
              aria-labelledby="agent-architecture-heading"
              className="bg-surface border border-border-subtle rounded-card p-5 space-y-3"
            >
              <h2
                id="agent-architecture-heading"
                className="text-base font-bold text-ink-primary"
              >
                Four-Component Agent Architecture
              </h2>
              <p className="text-xs text-ink-secondary">
                Represents the four interacting simulation agent classes defined
                in the EVORA research methodology:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE]">
                  <div className="font-semibold text-[#18181B] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#52525B]" aria-hidden="true" />
                    <span>1. Worker Agents ({simulatedAgents.length} Active)</span>
                  </div>
                  <p className="text-[#52525B] mt-1">
                    Virtual depot personnel with heterogeneous response delays
                    (1-9s) and walking speeds (1.25-1.55 m/s).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE]">
                  <div className="font-semibold text-[#18181B] flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#C84B28]" aria-hidden="true" />
                    <span>
                      2. Hazard Agents ({hazards.filter((h) => h.active).length} Plumes)
                    </span>
                  </div>
                  <p className="text-[#52525B] mt-1">
                    Propagate gas (% LEL), radiant heat (deg C), and smoke (ppm)
                    zones using ultrasonic wind telemetry ({activeScenario.windSpeedMps}{" "}
                    m/s {activeScenario.windDirectionLabel}).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE]">
                  <div className="font-semibold text-[#18181B] flex items-center gap-2">
                    <ShieldCheck
                      className="w-4 h-4 text-[#52525B]"
                      aria-hidden="true"
                    />
                    <span>3. Safety Agents (Threshold Gate)</span>
                  </div>
                  <p className="text-[#52525B] mt-1">
                    Continuously evaluate corridor risk scores and enforce hard
                    exclusion on any route exceeding the risk limit or failing
                    accessibility.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE]">
                  <div className="font-semibold text-[#18181B] flex items-center gap-2">
                    <Waypoints
                      className="w-4 h-4 text-[#52525B]"
                      aria-hidden="true"
                    />
                    <span>4. Routing Agents (Dynamic Guidance)</span>
                  </div>
                  <p className="text-[#52525B] mt-1">
                    Optimize corridor selection across distance, exposure,
                    density, and accessibility, pushing updates to field
                    signage in &lt;300 ms.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </UIStateWrapper>
    </div>
  );
}
