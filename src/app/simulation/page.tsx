"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  FastForward,
  Flame,
  Heart,
  Layers,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  StepBack,
  StepForward,
  UserCheck,
  Users,
  Volume2,
  Waypoints,
  Wind,
} from "lucide-react";
import { useEvora } from "@/lib/evora-context";
import { RiskBadge, RouteStatusBadge } from "@/components/shared/status-badge";
import { UIStateWrapper } from "@/components/shared/ui-state-wrapper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Point2D } from "@/types/evora";

interface SimulatedAgent {
  id: string;
  name: string;
  role: string;
  originZone: string;
  x: number;
  y: number;
  progress: number;
  speedMps: number;
  heartRate: number;
  status: "evacuated" | "moving" | "waiting" | "affected";
  routeCode: "Route A" | "Route B" | "Route C";
  targetMuster: "AP-ALPHA" | "AP-BRAVO";
  distanceRemainingM: number;
}

// 42 Authentic Pertamina Depot Personnel Roster for Realistic Multi-Agent Simulation
const DEPOT_PERSONNEL_ROSTER = [
  { name: "Ahmad Fauzi", role: "Loading Rack Tech", zone: "LB-01 Gantry A" },
  { name: "Budi Santoso", role: "Senior Gauger", zone: "T-102 Bund" },
  { name: "Cahyo Wibowo", role: "Valve Specialist", zone: "PIPE-01 Manifold" },
  { name: "Dedi Prasetyo", role: "Truck Driver", zone: "LB-01 Gantry A" },
  { name: "Eko Wahyudi", role: "HSE Inspector", zone: "OPS-01 Building" },
  { name: "Fajar Nugroho", role: "Pump Operator", zone: "VRU-01 Vapor Unit" },
  { name: "Gilang Pratama", role: "Tank Farm Operator", zone: "T-101 West" },
  { name: "Hadi Susanto", role: "Loading Bay Tech", zone: "LB-02 Gantry B" },
  { name: "Indra Kusuma", role: "Contractor Welder", zone: "PIPE-01 Manifold" },
  { name: "Joko Widodo", role: "Safety Officer", zone: "OPS-01 Building" },
  { name: "Kurniawan D.", role: "Truck Driver", zone: "LB-02 Gantry B" },
  { name: "Lukman Hakim", role: "Electrical Tech", zone: "VRU-01 Vapor Unit" },
  { name: "Muhamad Rizki", role: "Loading Inspector", zone: "LB-01 Gantry A" },
  { name: "Nanang Supriatna", role: "Firewatch Tech", zone: "T-103 East" },
  { name: "Oki Setiawan", role: "Terminal Operator", zone: "PIPE-01 Manifold" },
  { name: "Panji Gumilang", role: "Truck Driver", zone: "LB-01 Gantry A" },
  { name: "Rendra Kurnia", role: "Piping Engineer", zone: "PIPE-01 Manifold" },
  { name: "Surya Saputra", role: "Gauging Specialist", zone: "T-104 North" },
  { name: "Teguh Wibowo", role: "Loading Bay Tech", zone: "LB-02 Gantry B" },
  { name: "Untung Slamet", role: "Facility Security", zone: "EX-W1 Exit" },
  { name: "Vicky Prasetya", role: "Mechanical Tech", zone: "VRU-01 Vapor Unit" },
  { name: "Wahyu Hidayat", role: "Tank Inspector", zone: "T-102 Bund" },
  { name: "Yudi Arisandi", role: "Loading Driver", zone: "LB-02 Gantry B" },
  { name: "Zainal Abidin", role: "Instrument Tech", zone: "OPS-01 Building" },
  { name: "Agus Triyono", role: "Field Welder", zone: "PIPE-01 Manifold" },
  { name: "Bambang Irawan", role: "Loading Operator", zone: "LB-01 Gantry A" },
  { name: "Cecep Suparman", role: "Fire Brigade Lead", zone: "OPS-01 Building" },
  { name: "Danang Setiawan", role: "Pump Maintenance", zone: "VRU-01 Vapor Unit" },
  { name: "Edi Purwanto", role: "Field Gauger", zone: "T-101 West" },
  { name: "Firman Syah", role: "Terminal Logistics", zone: "LB-02 Gantry B" },
  { name: "Gunawan S.", role: "Pipeline Operator", zone: "PIPE-01 Manifold" },
  { name: "Heri Purnomo", role: "HSE Field Lead", zone: "OPS-01 Building" },
  { name: "Irfan Hakim", role: "Truck Driver", zone: "LB-01 Gantry A" },
  { name: "Junaedi", role: "Safety Watcher", zone: "T-103 East" },
  { name: "Kusnandar", role: "Loading Rack Tech", zone: "LB-02 Gantry B" },
  { name: "Luthfi Ansori", role: "VRU Technician", zone: "VRU-01 Vapor Unit" },
  { name: "Mulyadi", role: "Site Security", zone: "EX-S2 Exit" },
  { name: "Nugroho Adji", role: "Tank Gauger", zone: "T-104 North" },
  { name: "Oman Suherman", role: "Operations Lead", zone: "OPS-01 Building" },
  { name: "Purnomo Sidi", role: "Field Mechanic", zone: "PIPE-01 Manifold" },
  { name: "Rian Hidayat", role: "Loading Driver", zone: "LB-01 Gantry A" },
  { name: "Sigit Pramono", role: "Electrical Eng", zone: "VRU-01 Vapor Unit" },
];

function interpolateAlongWaypoints(waypoints: Point2D[], progress: number): Point2D {
  if (waypoints.length === 0) return { x: 124, y: 304 };
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

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("SCN-GAS-01");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<0.5 | 1 | 2 | 4>(1);
  const [simTickSeconds, setSimTickSeconds] = useState<number>(35);
  const [workerCount, setWorkerCount] = useState<number>(42);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>("AG-07");
  const [agentFilter, setAgentFilter] = useState<"all" | "moving" | "evacuated" | "affected">("all");
  const [isRouteABlockedManually, setIsRouteABlockedManually] = useState<boolean>(false);
  const [sirenActive, setSirenActive] = useState<boolean>(false);

  const activeScenario =
    scenarios.find((s) => s.id === selectedScenarioId) ?? scenarios[0];

  // Route definitions for the aligned orthogonal grid
  const routeAWaypoints = useMemo(
    () => [
      { x: 265, y: 372 },
      { x: 124, y: 372 },
      { x: 124, y: 132 },
      { x: 82, y: 132 },
    ],
    []
  );

  const routeBWaypoints = useMemo(
    () => [
      { x: 475, y: 372 },
      { x: 370, y: 372 },
      { x: 370, y: 472 },
      { x: 530, y: 472 },
    ],
    []
  );

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(500 / simSpeed);
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

  // Dynamic Multi-Agent Cohort simulation calculation
  const simulatedAgents = useMemo<SimulatedAgent[]>(() => {
    const count = Math.max(12, Math.min(64, workerCount));
    const list: SimulatedAgent[] = [];

    for (let i = 0; i < count; i++) {
      const rosterItem = DEPOT_PERSONNEL_ROSTER[i % DEPOT_PERSONNEL_ROSTER.length];
      const baseDelay = sirenActive ? 0 : (i % 6) * 3;
      const speedFactor = 0.9 + (i % 5) * 0.08 + (sirenActive ? 0.15 : 0);
      const effectiveElapsed = Math.max(0, simTickSeconds - baseDelay);
      const totalNeededSec = 165 / speedFactor;
      const progress = Math.min(1, effectiveElapsed / totalNeededSec);

      // Routing logic: if Route A is blocked or hazard expanded, divert to Route B
      const shouldDivertToB =
        isRouteABlockedManually ||
        hazardExpansionStep > 0 ||
        (i % 3 === 2);

      const targetRoute = shouldDivertToB ? "Route B" : "Route A";
      const targetMuster = shouldDivertToB ? "AP-BRAVO" : "AP-ALPHA";
      const waypoints = shouldDivertToB ? routeBWaypoints : routeAWaypoints;

      const basePos = interpolateAlongWaypoints(waypoints, progress);

      // Micro-spread so agents don't stack directly on top of each other
      const offsetAngle = (i * 137.5 * Math.PI) / 180;
      const offsetRadius = progress >= 1 ? (i % 4) * 4 : (i % 3) * 5;
      const x = Math.round(basePos.x + Math.cos(offsetAngle) * offsetRadius);
      const y = Math.round(basePos.y + Math.sin(offsetAngle) * offsetRadius);

      // Check hazard proximity
      const inHazard = hazards.some(
        (h) =>
          h.active &&
          h.radius > 0 &&
          Math.hypot(x - h.x, y - h.y) <= h.radius * 0.9
      );

      const status: "evacuated" | "moving" | "waiting" | "affected" =
        progress >= 1
          ? "evacuated"
          : inHazard
          ? "affected"
          : effectiveElapsed === 0
          ? "waiting"
          : "moving";

      // Distance remaining in meters
      const distanceRemainingM = Math.max(0, Math.round((1 - progress) * 140));

      // Physiological stress estimation based on hazard proximity & running speed
      const baseHeartRate = 72;
      const speedHeartRate = Math.round(speedFactor * 32);
      const hazardStressBonus = inHazard ? 45 : progress > 0 ? 18 : 0;
      const heartRate = baseHeartRate + speedHeartRate + hazardStressBonus;

      list.push({
        id: `AG-${(i + 1).toString().padStart(2, "0")}`,
        name: rosterItem.name,
        role: rosterItem.role,
        originZone: rosterItem.zone,
        x,
        y,
        progress,
        speedMps: Number((speedFactor * 1.35).toFixed(2)),
        heartRate,
        status,
        routeCode: targetRoute,
        targetMuster,
        distanceRemainingM,
      });
    }

    return list;
  }, [
    hazardExpansionStep,
    hazards,
    isRouteABlockedManually,
    routeAWaypoints,
    routeBWaypoints,
    simTickSeconds,
    sirenActive,
    workerCount,
  ]);

  const selectedAgent = useMemo(
    () => simulatedAgents.find((a) => a.id === selectedAgentId) ?? simulatedAgents[0],
    [selectedAgentId, simulatedAgents]
  );

  const evacuatedCount = simulatedAgents.filter((a) => a.status === "evacuated").length;
  const movingCount = simulatedAgents.filter((a) => a.status === "moving").length;
  const affectedCount = simulatedAgents.filter((a) => a.status === "affected").length;
  const waitingCount = simulatedAgents.filter((a) => a.status === "waiting").length;
  const evacuationRatePct = Math.round((evacuatedCount / simulatedAgents.length) * 100);

  const filteredAgents = useMemo(() => {
    if (agentFilter === "moving") return simulatedAgents.filter((a) => a.status === "moving");
    if (agentFilter === "evacuated") return simulatedAgents.filter((a) => a.status === "evacuated");
    if (agentFilter === "affected") return simulatedAgents.filter((a) => a.status === "affected");
    return simulatedAgents;
  }, [agentFilter, simulatedAgents]);

  const handleScenarioChange = (scenId: string) => {
    setSelectedScenarioId(scenId);
    const scen = scenarios.find((s) => s.id === scenId);
    if (scen) {
      setWorkerCount(scen.defaultWorkerCount);
      setSimTickSeconds(25);
      setIsPlaying(false);
      setIsRouteABlockedManually(false);
      setSirenActive(false);
      applyScenarioPreset(scenId);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header in C:/ti Minimalist Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Hybrid Multi-Agent Simulation Engine
            </span>
            <span className="text-xs font-mono text-slate-500">
              · 4-Component Coupled System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Multi-Agent Evacuation Simulation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time multi-agent coupling: Worker Agents interact with expanding Hazard Agents, Safety Threshold Gates, and Adaptive Routing Signage.
          </p>
        </div>

        {/* Action Header Interventions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSirenActive((s) => !s)}
            className={`cursor-pointer transition-all ${
              sirenActive ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : ""
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            <span>{sirenActive ? "Siren Active (Max Pace)" : "Broadcast Smart Horn"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              triggerHazardExpansion();
              if (simTickSeconds < 45) setSimTickSeconds(50);
            }}
            className="cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
            <span>Expand Vapor Plume</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsRouteABlockedManually((b) => !b)}
            className={`cursor-pointer transition-all ${
              isRouteABlockedManually ? "bg-rose-600 text-white font-bold border-rose-600" : ""
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
            <span>{isRouteABlockedManually ? "Route A Blocked (Diverting)" : "Block Route A"}</span>
          </Button>
        </div>
      </div>

      <UIStateWrapper pageTitle="Multi-Agent Simulation">
        {/* KPI Live Metric Cards in C:/ti Minimalist Style */}
        <section
          aria-label="Simulation live metrics"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5"
        >
          <Card className="p-4 bg-white border border-slate-200/90 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Evacuated</span>
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {evacuatedCount}{" "}
              <span className="text-xs font-normal text-slate-400">
                / {simulatedAgents.length}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${evacuationRatePct}%` }}
              />
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/90 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>In Transit</span>
              <Waypoints className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 mt-1">
              {movingCount}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-2">
              Pace: 1.35 m/s avg
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/90 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>At Risk</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 mt-1">
              {affectedCount}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-2">
              {affectedCount === 0 ? "0 in plume zone" : "Immediate reroute"}
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/90 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Simulation Clock</span>
              <Radio className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              T+{simTickSeconds}s
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-2">
              Max benchmark: 210s
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/90 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Corridor Flow</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {shouldDivertStatus(isRouteABlockedManually, hazardExpansionStep)}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-2">
              Dynamic sign sync &lt;300ms
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/90 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Completion</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
              {evacuationRatePct}%
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-2">
              Target safe muster: 100%
            </div>
          </Card>
        </section>

        {/* Main Simulation Workspace Grid: Canvas (8 cols) + Inspector & Agent Architecture (4 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left 8 Cols: Interactive Simulation Map & Playback Toolbar */}
          <div className="xl:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              {/* Simulation Stage Header */}
              <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-900 shadow-2xs">
                    T+{simTickSeconds}s / 210s
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {activeScenario.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <RiskBadge level={activeScenario.severity} />
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    Wind: {activeScenario.windSpeedMps} m/s SE
                  </span>
                </div>
              </div>

              {/* Dynamic Animated Simulation SVG Canvas */}
              <div className="relative bg-[#FAFBFC] overflow-hidden select-none">
                <svg
                  viewBox="0 0 1000 520"
                  role="img"
                  aria-label="Multi-agent evacuation simulation canvas"
                  className="w-full h-auto block"
                >
                  <defs>
                    <pattern
                      id="sim-cad-grid"
                      width="24"
                      height="24"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 24 0 L 0 0 0 24"
                        fill="none"
                        stroke="#EAEAEA"
                        strokeWidth="0.7"
                      />
                    </pattern>

                    {/* Gradient Plumes */}
                    <radialGradient id="sim-plume-gas" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.32" />
                      <stop offset="60%" stopColor="#EF4444" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0.02" />
                    </radialGradient>

                    <radialGradient id="sim-plume-fire" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                      <stop offset="65%" stopColor="#F59E0B" stopOpacity="0.14" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
                    </radialGradient>
                  </defs>

                  {/* Canvas Background Card */}
                  <rect
                    x="20"
                    y="18"
                    width="960"
                    height="484"
                    rx="14"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="21"
                    y="19"
                    width="958"
                    height="482"
                    rx="13"
                    fill="url(#sim-cad-grid)"
                  />

                  {/* Orthogonal Road Network Channels */}
                  <path
                    d="M 82 132 L 124 132 L 124 304 L 825 304 M 370 304 L 370 472 L 825 472 L 825 215 L 885 215"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 82 132 L 124 132 L 124 304 L 825 304 M 370 304 L 370 472 L 825 472 L 825 215 L 885 215"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1.2"
                    strokeDasharray="5 5"
                  />

                  {/* North Tank Farm Secondary Containment Bund */}
                  <rect
                    x="170"
                    y="56"
                    width="600"
                    height="152"
                    rx="10"
                    fill="#F8FAFC"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                  <text
                    x="756"
                    y="72"
                    textAnchor="end"
                    fill="#94A3B8"
                    fontSize="8.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    NORTH TANK BUND WALL
                  </text>

                  {/* Facility Structural Footprints */}
                  {assets.map((asset) => {
                    const isAssembly = asset.category === "assembly_point";
                    if (asset.shape === "circle") {
                      const r = asset.radius ?? 42;
                      return (
                        <g key={asset.id}>
                          <circle
                            cx={asset.x}
                            cy={asset.y}
                            r={r}
                            fill={isAssembly ? "#ECFDF5" : "#F8FAFC"}
                            stroke={isAssembly ? "#10B981" : "#94A3B8"}
                            strokeWidth={isAssembly ? 2 : 1.5}
                          />
                          <circle
                            cx={asset.x}
                            cy={asset.y}
                            r={isAssembly ? r - 6 : r - 8}
                            fill="#FFFFFF"
                            stroke={isAssembly ? "#A7F3D0" : "#E2E8F0"}
                            strokeWidth="1"
                          />
                          <text
                            x={asset.x}
                            y={asset.y - 2}
                            textAnchor="middle"
                            fill="#0F172A"
                            fontSize="10"
                            fontWeight="700"
                            fontFamily="monospace"
                          >
                            {asset.code}
                          </text>
                          <text
                            x={asset.x}
                            y={asset.y + 10}
                            textAnchor="middle"
                            fill={isAssembly ? "#059669" : "#64748B"}
                            fontSize="8"
                            fontWeight="600"
                            fontFamily="monospace"
                          >
                            {isAssembly ? "MUSTER SAFE" : `${asset.workersPresent} PERS`}
                          </text>
                        </g>
                      );
                    }

                    // Rectangular Assets
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
                      <g key={asset.id}>
                        <rect
                          x={rx}
                          y={ry}
                          width={w}
                          height={h}
                          rx="8"
                          fill="#FFFFFF"
                          stroke="#CBD5E1"
                          strokeWidth="1.4"
                        />
                        {isExit ? (
                          <>
                            <text
                              x={rx + w / 2}
                              y={ry + 18}
                              textAnchor="middle"
                              fill="#0F172A"
                              fontSize="9.5"
                              fontWeight="700"
                              fontFamily="monospace"
                            >
                              {asset.code}
                            </text>
                            <text
                              x={rx + w / 2}
                              y={ry + 30}
                              textAnchor="middle"
                              fill="#059669"
                              fontSize="7.5"
                              fontWeight="700"
                              fontFamily="monospace"
                            >
                              SAFE EXIT
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
                              fill="#F8FAFC"
                              stroke="#E2E8F0"
                              strokeWidth="1"
                            />
                            <text
                              x={rx + 16}
                              y={ry + h / 2 + 3.5}
                              fill="#0F172A"
                              fontSize="9"
                              fontWeight="700"
                              fontFamily="monospace"
                            >
                              {asset.code} · CENTRAL PIPE MANIFOLD
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
                              fill="#F1F5F9"
                            />
                            <text
                              x={rx + 12}
                              y={ry + 15}
                              fill="#0F172A"
                              fontSize="9"
                              fontWeight="700"
                              fontFamily="monospace"
                            >
                              {asset.code} · {asset.name.split(" (")[0]}
                            </text>
                            <text
                              x={rx + 12}
                              y={ry + 42}
                              fill="#64748B"
                              fontSize="9"
                            >
                              {asset.capacityOrSpec}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* Pulsing Hazard Zones with Expanding Radar Waves */}
                  {hazards
                    .filter((h) => h.active && h.radius > 0)
                    .map((hz) => {
                      const dynamicRadius = Math.round(
                        hz.radius * (0.85 + (simTickSeconds / 210) * 0.3)
                      );
                      const isGas = hz.type === "gas";

                      return (
                        <g key={hz.id}>
                          {/* Pulsing Outer Radar Wave */}
                          <circle
                            cx={hz.x}
                            cy={hz.y}
                            r={dynamicRadius}
                            fill="none"
                            stroke={isGas ? "#EF4444" : "#F59E0B"}
                            strokeWidth="1.5"
                            className="animate-radar-wave"
                          />
                          {/* Main Plume Circle */}
                          <circle
                            cx={hz.x}
                            cy={hz.y}
                            r={dynamicRadius}
                            fill={isGas ? "url(#sim-plume-gas)" : "url(#sim-plume-fire)"}
                            stroke={isGas ? "#EF4444" : "#F59E0B"}
                            strokeWidth="1.6"
                            strokeDasharray="6 4"
                          />
                          <circle
                            cx={hz.x}
                            cy={hz.y}
                            r={Math.max(12, dynamicRadius * 0.35)}
                            fill="none"
                            stroke={isGas ? "#EF4444" : "#F59E0B"}
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            opacity="0.5"
                          />
                          <text
                            x={hz.x}
                            y={hz.y - dynamicRadius - 6}
                            textAnchor="middle"
                            fill={isGas ? "#DC2626" : "#D97706"}
                            fontSize="9"
                            fontWeight="700"
                            fontFamily="monospace"
                          >
                            HAZARD AGENT: {hz.type.toUpperCase()} ({dynamicRadius}m)
                          </text>
                        </g>
                      );
                    })}

                  {/* Evacuation Corridors with Dynamic Animated Flow Trails */}
                  {/* Route A Path */}
                  <g>
                    <polyline
                      points={routeAWaypoints.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke={
                        isRouteABlockedManually || hazardExpansionStep > 0
                          ? "#EF4444"
                          : "#10B981"
                      }
                      strokeWidth={isRouteABlockedManually ? 3 : 4}
                      strokeDasharray={isRouteABlockedManually ? "5 5" : undefined}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {!isRouteABlockedManually && hazardExpansionStep === 0 && (
                      <polyline
                        points={routeAWaypoints.map((p) => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="#86EFAC"
                        strokeWidth="2.5"
                        strokeDasharray="6 12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-route-flow pointer-events-none"
                      />
                    )}
                  </g>

                  {/* Route B Path (Alternative / Diversion) */}
                  <g>
                    <polyline
                      points={routeBWaypoints.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke={
                        isRouteABlockedManually || hazardExpansionStep > 0
                          ? "#10B981"
                          : "#F59E0B"
                      }
                      strokeWidth={
                        isRouteABlockedManually || hazardExpansionStep > 0 ? 4 : 3
                      }
                      strokeDasharray={
                        isRouteABlockedManually || hazardExpansionStep > 0
                          ? undefined
                          : "8 5"
                      }
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {(isRouteABlockedManually || hazardExpansionStep > 0) && (
                      <polyline
                        points={routeBWaypoints.map((p) => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="#86EFAC"
                        strokeWidth="2.5"
                        strokeDasharray="6 12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-route-flow pointer-events-none"
                      />
                    )}
                  </g>

                  {/* Moving Worker Agent Dots with Selection Halo & Click Action */}
                  {filteredAgents.map((agent) => {
                    const isSelected = selectedAgentId === agent.id;
                    const fill =
                      agent.status === "evacuated"
                        ? "#10B981"
                        : agent.status === "affected"
                        ? "#EF4444"
                        : agent.status === "waiting"
                        ? "#F59E0B"
                        : "#2563EB";

                    return (
                      <g
                        key={agent.id}
                        transform={`translate(${agent.x}, ${agent.y})`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Worker Agent ${agent.id} (${agent.name}), status ${agent.status}`}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className="cursor-pointer transition-transform hover:scale-125"
                      >
                        {/* Selected Pulsing Halo */}
                        {isSelected && (
                          <circle
                            r="11"
                            fill="none"
                            stroke="#0F172A"
                            strokeWidth="2"
                            strokeDasharray="3 3"
                            className="animate-spin"
                            style={{ animationDuration: "6s" }}
                          />
                        )}
                        <circle
                          r={isSelected ? 6.5 : 5}
                          fill={fill}
                          stroke="#FFFFFF"
                          strokeWidth="1.6"
                          className="drop-shadow-xs"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Bottom Interactive Playback Controls Bar in C:/ti Style */}
              <div className="p-4 border-t border-slate-200/90 bg-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause Simulation</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Play Simulation</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setSimTickSeconds((s) => Math.max(0, s - 10));
                      }}
                      className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <StepBack className="w-4 h-4" />
                      <span>-10s</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setSimTickSeconds((s) => Math.min(210, s + 10));
                      }}
                      className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <StepForward className="w-4 h-4" />
                      <span>+10s</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setSimTickSeconds(0);
                        setIsRouteABlockedManually(false);
                        setSirenActive(false);
                        resetDemoState();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Playback Speed Multipliers */}
                  <div
                    role="group"
                    aria-label="Simulation speed multiplier"
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1"
                  >
                    {([0.5, 1, 2, 4] as const).map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setSimSpeed(spd)}
                        aria-pressed={simSpeed === spd}
                        className={`px-3 py-1 min-h-[30px] rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          simSpeed === spd
                            ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline Scrubber */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-slate-600">
                    <span className="font-semibold text-slate-800">
                      Progress Scrubber: T+{simTickSeconds}s / 210s
                    </span>
                    <span>
                      {evacuatedCount} Evacuated ({evacuationRatePct}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={210}
                    step={5}
                    value={simTickSeconds}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setSimTickSeconds(Number(e.target.value));
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>T+0s (Alarm)</span>
                    <span>T+60s (Midway)</span>
                    <span>T+120s (Diversion)</span>
                    <span>T+180s</span>
                    <span>T+210s (Target Safe)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Distribution Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-200/90 rounded-2xl shadow-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 mr-1">Filter Agents:</span>
                <button
                  type="button"
                  onClick={() => setAgentFilter("all")}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    agentFilter === "all"
                      ? "bg-slate-900 text-white border-slate-900 font-semibold"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  All ({simulatedAgents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAgentFilter("moving")}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    agentFilter === "moving"
                      ? "bg-blue-600 text-white border-blue-600 font-semibold"
                      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  In Transit ({movingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setAgentFilter("evacuated")}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    agentFilter === "evacuated"
                      ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  Evacuated ({evacuatedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setAgentFilter("affected")}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    agentFilter === "affected"
                      ? "bg-rose-600 text-white border-rose-600 font-semibold"
                      : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  }`}
                >
                  In Danger ({affectedCount})
                </button>
              </div>

              <span className="text-xs font-mono text-slate-500">
                Click any agent dot to open telemetry inspector
              </span>
            </div>
          </div>

          {/* Right 4 Cols: Live Selected Agent Inspector & 4-Agent Architecture Card */}
          <div className="xl:col-span-4 space-y-4">
            {/* Live Worker Agent Inspector Card */}
            {selectedAgent && (
              <section
                aria-label="Worker agent real-time inspector"
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {selectedAgent.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          selectedAgent.status === "evacuated"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : selectedAgent.status === "affected"
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedAgent.status === "evacuated"
                              ? "bg-emerald-500"
                              : selectedAgent.status === "affected"
                              ? "bg-rose-500"
                              : "bg-blue-500"
                          }`}
                        />
                        {selectedAgent.status.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedAgent.name}
                    </h2>
                    <p className="text-xs text-slate-500">{selectedAgent.role}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono">Heart Rate</span>
                    <div className="flex items-center justify-end gap-1 text-sm font-mono font-bold text-rose-600 mt-0.5">
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span>{selectedAgent.heartRate} bpm</span>
                    </div>
                  </div>
                </div>

                {/* Agent Real-Time Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">CURRENT ASSIGNED ROUTE</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {selectedAgent.routeCode}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">TARGET MUSTER POINT</span>
                    <span className="font-bold text-emerald-700 mt-0.5 block">
                      {selectedAgent.targetMuster}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">WALKING VELOCITY</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {selectedAgent.speedMps} m/s
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">DISTANCE TO SAFETY</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {selectedAgent.distanceRemainingM} meters
                    </span>
                  </div>
                </div>

                {/* Progress bar to safety */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Evacuation Progress</span>
                    <span className="font-mono font-bold">
                      {Math.round(selectedAgent.progress * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(selectedAgent.progress * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Origin: {selectedAgent.originZone}</span>
                  <span className="font-mono">
                    Coord: ({selectedAgent.x}, {selectedAgent.y})
                  </span>
                </div>
              </section>
            )}

            {/* Scenario & Worker Cohort Parameters */}
            <section
              aria-labelledby="sim-parameters-heading"
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4"
            >
              <h2
                id="sim-parameters-heading"
                className="text-sm font-bold text-slate-900 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-slate-700" />
                <span>Scenario & Cohort Controls</span>
              </h2>

              <div>
                <label
                  htmlFor="scenario-select-input"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  Active Incident Scenario:
                </label>
                <select
                  id="scenario-select-input"
                  value={selectedScenarioId}
                  onChange={(e) => handleScenarioChange(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 min-h-[40px] cursor-pointer"
                >
                  {scenarios.map((scen) => (
                    <option key={scen.id} value={scen.id}>
                      {scen.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {activeScenario.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                  <label htmlFor="worker-count-slider">
                    Virtual Worker Agent Count:
                  </label>
                  <span className="font-mono text-blue-600">{workerCount} Agents</span>
                </div>
                <input
                  id="worker-count-slider"
                  type="range"
                  min={16}
                  max={64}
                  step={2}
                  value={workerCount}
                  onChange={(e) => setWorkerCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>16 (Night Shift)</span>
                  <span>42 (Standard Day)</span>
                  <span>64 (Turnaround)</span>
                </div>
              </div>
            </section>

            {/* 4-Component Agent Architecture from EVORA Abstract */}
            <section
              aria-labelledby="agent-architecture-heading"
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <h2
                id="agent-architecture-heading"
                className="text-sm font-bold text-slate-900 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Four-Component Agent Architecture</span>
              </h2>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>1. Worker Agents ({simulatedAgents.length} Active)</span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Autonomous personnel with individual reaction times (0-15s), velocities (1.2-1.6 m/s), and physical stress models.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    <span>2. Hazard Agents ({hazards.filter((h) => h.active).length} Active Plumes)</span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Continuous physical dispersion of flammable vapor (% LEL), thermal radiation (°C), and smoke opacity.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3. Safety Agents (Threshold Gate)</span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Continuous corridor risk evaluation, enforcing hard boundary exclusion when gas exceeds 40% LEL.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <Waypoints className="w-3.5 h-3.5 text-amber-600" />
                    <span>4. Routing Agents (Dynamic Guidance)</span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Adaptive path re-optimization propagating instant re-route instructions to field digital signage in &lt;300ms.
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

function shouldDivertStatus(isBlocked: boolean, expansionStep: number): string {
  if (isBlocked) return "Diverted (Route B)";
  if (expansionStep > 0) return "Diverted (Route B)";
  return "Clear (Route A)";
}
