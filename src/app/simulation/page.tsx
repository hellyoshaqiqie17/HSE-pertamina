"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Compass,
  Eye,
  FastForward,
  Flame,
  Heart,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  StepBack,
  StepForward,
  Thermometer,
  UserCheck,
  Users,
  Volume2,
  VolumeX,
  Waypoints,
  Wind,
  Zap,
} from "lucide-react";
import { useEvora } from "@/lib/evora-context";
import { RiskBadge, RouteStatusBadge } from "@/components/shared/status-badge";
import { UIStateWrapper } from "@/components/shared/ui-state-wrapper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Point2D, UserRoleLevel } from "@/types/evora";

interface WorkerAgentSpec {
  id: string;
  name: string;
  role: string;
  roleLevel: UserRoleLevel;
  originZone: string;
  startPos: Point2D;
  baseDelaySec: number;
  speedMps: number;
  assignedRoute: "Route A" | "Route B";
  targetMuster: "AP-ALPHA" | "AP-BRAVO";
}

interface SimulatedAgentState extends WorkerAgentSpec {
  x: number;
  y: number;
  progress: number;
  heartRate: number;
  status: "waiting" | "moving" | "diverted" | "evacuated" | "affected";
  distanceRemainingM: number;
  headingDeg: number;
  stressLevel: "Normal" | "Elevated" | "High" | "Critical";
}

// 43 Authentic Pertamina Depot Personnel Roster with Realistic Starting Positions Across All Depot Zones
const DEPOT_WORKER_SPECS: WorkerAgentSpec[] = [
  // Level 2 Safety Inspector on Sidak at Gantry Bay B (Side B)
  {
    id: "INSP-01",
    name: "Bambang Sujatmiko",
    role: "Inspektur K3 (Sidak Lapangan B)",
    roleLevel: "level-2-inspector",
    originZone: "LB-02 Gantry Bay B (Side B)",
    startPos: { x: 485, y: 360 },
    baseDelaySec: 0,
    speedMps: 1.55,
    assignedRoute: "Route B",
    targetMuster: "AP-BRAVO",
  },

  // Tank Farm Cohort (8 personnel across T-101..104)
  { id: "AG-01", name: "Ahmad Fauzi", role: "Tank Farm Gauger", roleLevel: "level-1-operator", originZone: "Tank T-101", startPos: { x: 235, y: 130 }, baseDelaySec: 2, speedMps: 1.38, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-02", name: "Budi Santoso", role: "Senior Tank Gauger", roleLevel: "level-1-operator", originZone: "Tank T-101", startPos: { x: 255, y: 140 }, baseDelaySec: 4, speedMps: 1.32, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-03", name: "Cahyo Wibowo", role: "Rim-Seal Inspector", roleLevel: "level-1-operator", originZone: "Tank T-102", startPos: { x: 385, y: 125 }, baseDelaySec: 1, speedMps: 1.45, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-04", name: "Dedi Prasetyo", role: "Bund Wall Watcher", roleLevel: "level-1-operator", originZone: "Tank T-102", startPos: { x: 405, y: 140 }, baseDelaySec: 3, speedMps: 1.40, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-05", name: "Eko Wahyudi", role: "Drain Valve Tech", roleLevel: "level-1-operator", originZone: "Tank T-103", startPos: { x: 535, y: 130 }, baseDelaySec: 5, speedMps: 1.30, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-06", name: "Fajar Nugroho", role: "Level Sensor Tech", roleLevel: "level-1-operator", originZone: "Tank T-103", startPos: { x: 555, y: 140 }, baseDelaySec: 3, speedMps: 1.36, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-07", name: "Gilang Pratama", role: "Tank Farm Operator", roleLevel: "level-1-operator", originZone: "Tank T-104", startPos: { x: 685, y: 130 }, baseDelaySec: 4, speedMps: 1.42, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-08", name: "Hadi Susanto", role: "Cathodic Prot Tech", roleLevel: "level-1-operator", originZone: "Tank T-104", startPos: { x: 705, y: 140 }, baseDelaySec: 6, speedMps: 1.28, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },

  // Central Pipe Manifold Cohort (8 personnel along PIPE-01)
  { id: "AG-09", name: "Indra Kusuma", role: "Manifold Flange Welder", roleLevel: "level-1-operator", originZone: "PIPE-01 West", startPos: { x: 260, y: 234 }, baseDelaySec: 1, speedMps: 1.50, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-10", name: "Joko Widodo", role: "Valve Pit Operator", roleLevel: "level-1-operator", originZone: "PIPE-01 Center", startPos: { x: 380, y: 234 }, baseDelaySec: 2, speedMps: 1.44, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-11", name: "Kurniawan D.", role: "Piping Maintenance", roleLevel: "level-1-operator", originZone: "PIPE-01 Center", startPos: { x: 420, y: 234 }, baseDelaySec: 2, speedMps: 1.48, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-12", name: "Lukman Hakim", role: "Pressure Relief Tech", roleLevel: "level-1-operator", originZone: "PIPE-01 Center", startPos: { x: 460, y: 234 }, baseDelaySec: 1, speedMps: 1.52, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-13", name: "Muhamad Rizki", role: "Flow Meter Inspector", roleLevel: "level-1-operator", originZone: "PIPE-01 East", startPos: { x: 540, y: 234 }, baseDelaySec: 3, speedMps: 1.35, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-14", name: "Nanang Supriatna", role: "Corrosion Specialist", roleLevel: "level-1-operator", originZone: "PIPE-01 East", startPos: { x: 590, y: 234 }, baseDelaySec: 4, speedMps: 1.32, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-15", name: "Oki Setiawan", role: "Flange F-12 Inspector", roleLevel: "level-1-operator", originZone: "PIPE-01 Center", startPos: { x: 435, y: 234 }, baseDelaySec: 0, speedMps: 1.55, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-16", name: "Panji Gumilang", role: "Transfer Pump Tech", roleLevel: "level-1-operator", originZone: "PIPE-01 West", startPos: { x: 310, y: 234 }, baseDelaySec: 3, speedMps: 1.40, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },

  // Loading Gantry Bay A Cohort (10 personnel at LB-01)
  { id: "AG-17", name: "Rendra Kurnia", role: "Gantry Bay A Lead", roleLevel: "level-1-operator", originZone: "LB-01 Gantry A", startPos: { x: 230, y: 345 }, baseDelaySec: 1, speedMps: 1.45, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-18", name: "Surya Saputra", role: "Bottom Loading Tech", roleLevel: "level-1-operator", originZone: "LB-01 Gantry A", startPos: { x: 250, y: 355 }, baseDelaySec: 2, speedMps: 1.40, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-19", name: "Teguh Wibowo", role: "Vapor Hose Specialist", roleLevel: "level-1-operator", originZone: "LB-01 Gantry A", startPos: { x: 270, y: 345 }, baseDelaySec: 2, speedMps: 1.42, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-20", name: "Untung Slamet", role: "Fuel Tanker Driver #01", roleLevel: "level-1-operator", originZone: "LB-01 Gantry A", startPos: { x: 290, y: 355 }, baseDelaySec: 3, speedMps: 1.36, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-21", name: "Vicky Prasetya", role: "Fuel Tanker Driver #02", roleLevel: "level-1-operator", originZone: "LB-01 Gantry A", startPos: { x: 310, y: 345 }, baseDelaySec: 3, speedMps: 1.38, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-22", name: "Wahyu Hidayat", role: "Overfill Protection", roleLevel: "level-1-operator", originZone: "LB-01 Gantry A", startPos: { x: 240, y: 365 }, baseDelaySec: 1, speedMps: 1.48, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-23", name: "Yudi Arisandi", role: "Static Grounding Tech", roleLevel: "level-1-operator", originZone: "LB-01 Gantry A", startPos: { x: 260, y: 365 }, baseDelaySec: 2, speedMps: 1.44, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-24", name: "Zainal Abidin", role: "Quality Sample Officer", roleLevel: "level-1-operator", originZone: "LB-01 Gantry A", startPos: { x: 280, y: 365 }, baseDelaySec: 2, speedMps: 1.40, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-25", name: "Agus Triyono", role: "Safety Escort Officer", roleLevel: "level-1-operator", originZone: "LB-01 Gantry A", startPos: { x: 300, y: 365 }, baseDelaySec: 1, speedMps: 1.50, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-26", name: "Bambang Irawan", role: "Metering Tech", roleLevel: "level-1-operator", originZone: "LB-01 Gantry A", startPos: { x: 320, y: 365 }, baseDelaySec: 4, speedMps: 1.34, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },

  // Loading Gantry Bay B Cohort (8 personnel at LB-02)
  { id: "AG-27", name: "Cecep Suparman", role: "Gantry Bay B Lead", roleLevel: "level-1-operator", originZone: "LB-02 Gantry B", startPos: { x: 440, y: 345 }, baseDelaySec: 2, speedMps: 1.42, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-28", name: "Danang Setiawan", role: "Multi-Product Arm Tech", roleLevel: "level-1-operator", originZone: "LB-02 Gantry B", startPos: { x: 460, y: 355 }, baseDelaySec: 2, speedMps: 1.40, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-29", name: "Edi Purwanto", role: "Fuel Tanker Driver #03", roleLevel: "level-1-operator", originZone: "LB-02 Gantry B", startPos: { x: 480, y: 345 }, baseDelaySec: 3, speedMps: 1.35, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-30", name: "Firman Syah", role: "Fuel Tanker Driver #04", roleLevel: "level-1-operator", originZone: "LB-02 Gantry B", startPos: { x: 500, y: 355 }, baseDelaySec: 4, speedMps: 1.32, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-31", name: "Gunawan S.", role: "Hose Inspection Tech", roleLevel: "level-1-operator", originZone: "LB-02 Gantry B", startPos: { x: 450, y: 365 }, baseDelaySec: 1, speedMps: 1.46, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-32", name: "Heri Purnomo", role: "Billing & Dispatch", roleLevel: "level-1-operator", originZone: "LB-02 Gantry B", startPos: { x: 470, y: 365 }, baseDelaySec: 3, speedMps: 1.38, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-33", name: "Irfan Hakim", role: "Gantry Safety Guard", roleLevel: "level-1-operator", originZone: "LB-02 Gantry B", startPos: { x: 490, y: 365 }, baseDelaySec: 2, speedMps: 1.44, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-34", name: "Junaedi", role: "Additive Injection Tech", roleLevel: "level-1-operator", originZone: "LB-02 Gantry B", startPos: { x: 510, y: 365 }, baseDelaySec: 3, speedMps: 1.36, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },

  // Vapor Recovery Unit (VRU-01) Cohort (4 personnel)
  { id: "AG-35", name: "Kusnandar", role: "VRU Lead Engineer", roleLevel: "level-1-operator", originZone: "VRU-01 Skid", startPos: { x: 650, y: 345 }, baseDelaySec: 1, speedMps: 1.45, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-36", name: "Luthfi Ansori", role: "Carbon Bed Technician", roleLevel: "level-1-operator", originZone: "VRU-01 Skid", startPos: { x: 670, y: 355 }, baseDelaySec: 2, speedMps: 1.40, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-37", name: "Mulyadi", role: "Vacuum Pump Tech", roleLevel: "level-1-operator", originZone: "VRU-01 Skid", startPos: { x: 690, y: 345 }, baseDelaySec: 3, speedMps: 1.38, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },
  { id: "AG-38", name: "Nugroho Adji", role: "Flame Arrestor Tech", roleLevel: "level-1-operator", originZone: "VRU-01 Skid", startPos: { x: 710, y: 355 }, baseDelaySec: 2, speedMps: 1.42, assignedRoute: "Route B", targetMuster: "AP-BRAVO" },

  // Operations Control Building (OPS-01) Cohort (4 personnel)
  { id: "AG-39", name: "Oman Suherman", role: "Terminal Operations Lead", roleLevel: "level-3-manager", originZone: "OPS-01 Building", startPos: { x: 190, y: 440 }, baseDelaySec: 1, speedMps: 1.50, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-40", name: "Purnomo Sidi", role: "HSE Control Room Tech", roleLevel: "level-3-manager", originZone: "OPS-01 Building", startPos: { x: 210, y: 450 }, baseDelaySec: 2, speedMps: 1.45, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-41", name: "Rian Hidayat", role: "Emergency Coordinator", roleLevel: "level-4-ert", originZone: "OPS-01 Building", startPos: { x: 230, y: 440 }, baseDelaySec: 1, speedMps: 1.52, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
  { id: "AG-42", name: "Sigit Pramono", role: "SCADA & Telemetry Tech", roleLevel: "level-3-manager", originZone: "OPS-01 Building", startPos: { x: 250, y: 450 }, baseDelaySec: 2, speedMps: 1.42, assignedRoute: "Route A", targetMuster: "AP-ALPHA" },
];

function interpolatePath(points: Point2D[], progress: number): { pt: Point2D; angleDeg: number } {
  if (points.length === 0) return { pt: { x: 124, y: 304 }, angleDeg: 0 };
  if (points.length === 1 || progress <= 0) return { pt: points[0], angleDeg: 0 };
  if (progress >= 1) {
    const p1 = points[points.length - 2] ?? points[0];
    const p2 = points[points.length - 1];
    const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
    return { pt: p2, angleDeg: Math.round(angle) };
  }

  const segments: { from: Point2D; to: Point2D; len: number }[] = [];
  let totalLen = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    segments.push({ from: points[i], to: points[i + 1], len });
    totalLen += len;
  }

  let targetDist = progress * totalLen;
  for (const seg of segments) {
    if (targetDist <= seg.len || seg.len === 0) {
      const ratio = seg.len === 0 ? 0 : targetDist / seg.len;
      const angle = (Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x) * 180) / Math.PI;
      return {
        pt: {
          x: Math.round(seg.from.x + (seg.to.x - seg.from.x) * ratio),
          y: Math.round(seg.from.y + (seg.to.y - seg.from.y) * ratio),
        },
        angleDeg: Math.round(angle),
      };
    }
    targetDist -= seg.len;
  }

  return { pt: points[points.length - 1], angleDeg: 0 };
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
    currentRoleLevel,
    setCurrentRoleLevel,
    stationaryPosts,
    aiExplosionPrediction,
    isDelugeActive,
    toggleDelugeSystem,
    triggerSideBInspectionScenario,
    isSideBScenarioActive,
  } = useEvora();

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("SCN-GAS-01");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<0.5 | 1 | 2 | 4>(1);
  const [simTickSeconds, setSimTickSeconds] = useState<number>(35);
  const [workerCount, setWorkerCount] = useState<number>(43);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>("INSP-01");
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [agentFilter, setAgentFilter] = useState<"all" | "moving" | "evacuated" | "affected">("all");
  const [roleLevelFilter, setRoleLevelFilter] = useState<UserRoleLevel | "all">("all");
  const [showBlastRadiusOverlay, setShowBlastRadiusOverlay] = useState<boolean>(true);
  const [isRouteABlockedManually, setIsRouteABlockedManually] = useState<boolean>(false);
  const [sirenActive, setSirenActive] = useState<boolean>(false);
  const [showDensityHeatmap, setShowDensityHeatmap] = useState<boolean>(true);
  const [canvasTheme, setCanvasTheme] = useState<"dark" | "light">("dark");
  const [viewAngle, setViewAngle] = useState<"2d" | "iso">("2d");

  // Single Agent Manual Re-Route Override Map (id -> "AP-ALPHA" | "AP-BRAVO")
  const [manualAgentOverrides, setManualAgentOverrides] = useState<Record<string, "AP-ALPHA" | "AP-BRAVO">>({});

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) ?? scenarios[0];

  // Continuous Clock Playback with smooth increments
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(400 / simSpeed);
    const timer = window.setInterval(() => {
      setSimTickSeconds((prev) => {
        if (prev >= 210) {
          setIsPlaying(false);
          return 210;
        }
        return prev + 2;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, simSpeed]);

  // Compute complete realistic paths from each agent's individual start station to assembly points
  const simulatedAgents = useMemo<SimulatedAgentState[]>(() => {
    const count = Math.max(12, Math.min(43, workerCount));
    const activeCohort = DEPOT_WORKER_SPECS.slice(0, count);

    return activeCohort.map((spec) => {
      const delay = sirenActive ? 0 : spec.baseDelaySec;
      const effectiveSec = Math.max(0, simTickSeconds - delay);
      const speedMultiplier = (sirenActive ? 1.2 : 1.0) * (spec.speedMps / 1.4);
      const totalTimeNeededSec = 145 / speedMultiplier;
      const progress = Math.min(1, effectiveSec / totalTimeNeededSec);

      // Routing logic:
      // If Route A is blocked, or hazard expanded westward, or user manually rerouted this agent,
      // or if Side B scenario is active and worker is in Bay B / Level 2 Inspector:
      const isSideBWorker = spec.originZone.includes("Gantry Bay B") || spec.id === "INSP-01";
      const manualDest = manualAgentOverrides[spec.id];
      const forceDivertToB =
        manualDest === "AP-BRAVO" ||
        isRouteABlockedManually ||
        hazardExpansionStep > 0 ||
        (isSideBScenarioActive && isSideBWorker) ||
        spec.assignedRoute === "Route B";

      const targetMuster: "AP-ALPHA" | "AP-BRAVO" = forceDivertToB ? "AP-BRAVO" : "AP-ALPHA";
      const routeCode: "Route A" | "Route B" = forceDivertToB ? "Route B" : "Route A";

      // Build waypoints dynamically starting from worker's specific origin:
      const points: Point2D[] = [spec.startPos];

      if (targetMuster === "AP-ALPHA") {
        // Path to Muster Alpha (West Gate):
        // 1. Move to Main Avenue y=304 or corridor x=124
        if (spec.startPos.y < 200) {
          // North tank farm: step out through bund opening at (370, 208) then to y=304
          points.push({ x: spec.startPos.x, y: 208 });
          points.push({ x: 370, y: 208 });
          points.push({ x: 370, y: 304 });
          points.push({ x: 124, y: 304 });
        } else if (spec.startPos.y >= 330) {
          // South bays / operations: step up to y=304
          points.push({ x: spec.startPos.x, y: 304 });
          points.push({ x: 124, y: 304 });
        } else {
          // Manifold y=234: step to x=124
          points.push({ x: 124, y: 234 });
          points.push({ x: 124, y: 304 });
        }
        // Walk north along west corridor to Assembly Point Alpha (82, 132)
        points.push({ x: 124, y: 132 });
        points.push({ x: 82, y: 132 });
      } else {
        // Path to Muster Bravo (South Gantry Green Zone):
        if (spec.startPos.y < 200) {
          // North tank farm: step out at (370, 208) -> down to y=472 -> to AP-BRAVO (530, 472)
          points.push({ x: spec.startPos.x, y: 208 });
          points.push({ x: 370, y: 208 });
          points.push({ x: 370, y: 472 });
          points.push({ x: 530, y: 472 });
        } else if (spec.startPos.y <= 300) {
          // Manifold: step down to central avenue y=304 -> x=370 -> y=472 -> (530, 472)
          points.push({ x: 370, y: 304 });
          points.push({ x: 370, y: 472 });
          points.push({ x: 530, y: 472 });
        } else {
          // Gantry Bay A / B / VRU: step directly down to South Road y=472 -> (530, 472)
          points.push({ x: spec.startPos.x, y: 472 });
          points.push({ x: 530, y: 472 });
        }
      }

      const { pt, angleDeg } = interpolatePath(points, progress);

      // Check proximity to active hazards
      const inHazard = hazards.some(
        (h) => h.active && h.radius > 0 && Math.hypot(pt.x - h.x, pt.y - h.y) <= h.radius * 0.92
      );

      const status: "waiting" | "moving" | "diverted" | "evacuated" | "affected" =
        progress >= 1
          ? "evacuated"
          : inHazard
          ? "affected"
          : forceDivertToB && spec.assignedRoute === "Route A"
          ? "diverted"
          : effectiveSec === 0
          ? "waiting"
          : "moving";

      const distanceRemainingM = Math.max(0, Math.round((1 - progress) * 125));

      // Physiological heart rate model: base 70 + speed exertion + panic adrenaline if hazard nearby
      const heartRate = Math.round(
        70 + (spec.speedMps - 1.2) * 50 + (progress > 0 ? 15 : 0) + (inHazard ? 48 : forceDivertToB ? 22 : 0)
      );

      const stressLevel =
        inHazard ? "Critical" : heartRate > 120 ? "High" : heartRate > 95 ? "Elevated" : "Normal";

      return {
        ...spec,
        x: pt.x,
        y: pt.y,
        progress,
        heartRate,
        status,
        distanceRemainingM,
        headingDeg: angleDeg,
        stressLevel,
      };
    });
  }, [
    hazardExpansionStep,
    hazards,
    isRouteABlockedManually,
    isSideBScenarioActive,
    manualAgentOverrides,
    simTickSeconds,
    sirenActive,
    workerCount,
  ]);

  const selectedAgent = useMemo(
    () => simulatedAgents.find((a) => a.id === selectedAgentId) ?? simulatedAgents[0],
    [selectedAgentId, simulatedAgents]
  );

  const hoveredAgent = useMemo(
    () => simulatedAgents.find((a) => a.id === hoveredAgentId) ?? null,
    [hoveredAgentId, simulatedAgents]
  );

  const evacuatedCount = simulatedAgents.filter((a) => a.status === "evacuated").length;
  const movingCount = simulatedAgents.filter((a) => a.status === "moving" || a.status === "diverted").length;
  const affectedCount = simulatedAgents.filter((a) => a.status === "affected").length;
  const waitingCount = simulatedAgents.filter((a) => a.status === "waiting").length;
  const evacuationRatePct = Math.round((evacuatedCount / simulatedAgents.length) * 100);

  const filteredAgents = useMemo(() => {
    let list = simulatedAgents;
    if (agentFilter === "moving") list = list.filter((a) => a.status === "moving" || a.status === "diverted");
    else if (agentFilter === "evacuated") list = list.filter((a) => a.status === "evacuated");
    else if (agentFilter === "affected") list = list.filter((a) => a.status === "affected");

    if (roleLevelFilter !== "all") {
      list = list.filter((a) => a.roleLevel === roleLevelFilter);
    }
    return list;
  }, [agentFilter, roleLevelFilter, simulatedAgents]);

  const handleScenarioChange = (scenId: string) => {
    setSelectedScenarioId(scenId);
    const scen = scenarios.find((s) => s.id === scenId);
    if (scen) {
      setWorkerCount(scen.defaultWorkerCount);
      setSimTickSeconds(25);
      setIsPlaying(false);
      setIsRouteABlockedManually(false);
      setSirenActive(false);
      setManualAgentOverrides({});
      applyScenarioPreset(scenId);
    }
  };

  const handleManualRerouteAgent = (agentId: string) => {
    setManualAgentOverrides((prev) => ({
      ...prev,
      [agentId]: prev[agentId] === "AP-BRAVO" ? "AP-ALPHA" : "AP-BRAVO",
    }));
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Page Header in C:/ti Minimalist Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Real-Time Multi-Agent Physics & Behavior Engine
            </span>
            <span className="text-xs font-mono text-slate-500">
              · 42 Autonomous Personnel Agents
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Multi-Agent Evacuation Simulation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Coupled continuous simulation: Worker Agents dynamically avoid expanding Gas & Thermal Hazards, navigate road channels, and adapt to live digital signage.
          </p>
        </div>

        {/* Live Simulation Emergency Interventions Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSirenActive((s) => !s)}
            className={`cursor-pointer transition-all ${
              sirenActive ? "bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm" : ""
            }`}
          >
            {sirenActive ? <Volume2 className="w-3.5 h-3.5 mr-1.5 text-slate-950 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5 mr-1.5 text-amber-600" />}
            <span>{sirenActive ? "Smart Siren Active (Panic Sprint)" : "Broadcast Smart Siren"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              triggerHazardExpansion();
              if (simTickSeconds < 40) setSimTickSeconds(45);
            }}
            className="cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
            <span>{hazardExpansionStep > 0 ? "Reset Vapor Plume" : "Simulate West Plume Flare"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsRouteABlockedManually((b) => !b)}
            className={`cursor-pointer transition-all ${
              isRouteABlockedManually ? "bg-rose-600 text-white font-bold border-rose-600 shadow-sm" : ""
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
            <span>{isRouteABlockedManually ? "Route A Blocked (All Diverted)" : "Block Route A (Debris)"}</span>
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
              Pace: {(sirenActive ? 1.62 : 1.38).toFixed(2)} m/s avg
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
              {affectedCount === 0 ? "0 within 40% LEL" : "Immediate auto-reroute"}
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
              Benchmark limit: 210s
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/90 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Active Directive</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-base font-bold font-mono text-slate-900 mt-2 truncate">
              {isRouteABlockedManually || hazardExpansionStep > 0 ? "ROUTE B (DIVERT)" : "ROUTE A (PRIMARY)"}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              Signage sync: &lt;300ms
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/90 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Evacuation Cleared</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
              {evacuationRatePct}%
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-2">
              Muster: Alpha & Bravo
            </div>
          </Card>
        </section>

        {/* Main Simulation Workspace Grid: Simulation Stage (8 cols) + Live Inspector & Controls (4 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left 8 Cols: High-Tech Control Room / Blueprint Simulation Canvas */}
          <div className="xl:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              {/* Simulation Stage Ribbon */}
              <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-900 shadow-2xs">
                    T+{simTickSeconds}s / 210s
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {activeScenario.name}
                  </span>
                  <RiskBadge level={activeScenario.severity} />
                </div>

                {/* Canvas Options Toggles & Scenario Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBlastRadiusOverlay((b) => !b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      showBlastRadiusOverlay
                        ? "bg-rose-50 text-rose-700 border-rose-200 font-semibold"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    Radius BLEVE T-102: {showBlastRadiusOverlay ? "ON" : "OFF"}
                  </button>

                  <button
                    type="button"
                    onClick={triggerSideBInspectionScenario}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSideBScenarioActive
                        ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                        : "bg-amber-50 hover:bg-amber-100/70 text-amber-800 border-amber-200"
                    }`}
                    title="Simulasi insiden gas naik saat inspektur K3 menyidak Side B"
                  >
                    <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-600" />
                    <span>Skenario Sidak Side B</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleDelugeSystem}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isDelugeActive
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "bg-blue-50 hover:bg-blue-100/70 text-blue-800 border-blue-200"
                    }`}
                    title="Semprotan pendingin air cangkang tangki T-102"
                  >
                    <span>{isDelugeActive ? "Deluge Aktif" : "Deluge T-102"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDensityHeatmap((h) => !h)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      showDensityHeatmap
                        ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    Heatmap: {showDensityHeatmap ? "ON" : "OFF"}
                  </button>

                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setCanvasTheme("dark")}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        canvasTheme === "dark" ? "bg-slate-900 text-white font-bold" : "text-slate-600"
                      }`}
                    >
                      Dark Stage
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasTheme("light")}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        canvasTheme === "light" ? "bg-white text-slate-900 font-bold shadow-2xs" : "text-slate-600"
                      }`}
                    >
                      CAD Blueprint
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive SVG Canvas */}
              <div
                className={`relative select-none transition-colors duration-300 ${
                  canvasTheme === "dark" ? "bg-[#090D16]" : "bg-[#F8FAFC]"
                }`}
              >
                <svg
                  viewBox="0 0 1000 520"
                  role="img"
                  aria-label="Interactive multi-agent evacuation simulation stage"
                  className="w-full h-auto block"
                >
                  <defs>
                    <pattern
                      id="grid-dots-dark"
                      width="24"
                      height="24"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="2" cy="2" r="0.85" fill="#1E293B" />
                    </pattern>
                    <pattern
                      id="grid-dots-light"
                      width="24"
                      height="24"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="2" cy="2" r="0.85" fill="#E2E8F0" />
                    </pattern>

                    {/* Gradient Plumes for Glowing Dark Stage */}
                    <radialGradient id="plume-gas-dark" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
                      <stop offset="50%" stopColor="#EF4444" stopOpacity="0.22" />
                      <stop offset="85%" stopColor="#EF4444" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                    </radialGradient>

                    <radialGradient id="plume-gas-light" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.30" />
                      <stop offset="60%" stopColor="#EF4444" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0.02" />
                    </radialGradient>

                    <radialGradient id="plume-fire-dark" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
                      <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.20" />
                      <stop offset="90%" stopColor="#F59E0B" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </radialGradient>

                    {/* Bottleneck Density Glow */}
                    <radialGradient id="bottleneck-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                      <stop offset="80%" stopColor="#3B82F6" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Stage Background */}
                  <rect
                    x="18"
                    y="16"
                    width="964"
                    height="488"
                    rx="14"
                    fill={canvasTheme === "dark" ? "#0B1120" : "#FFFFFF"}
                    stroke={canvasTheme === "dark" ? "#1E293B" : "#E2E8F0"}
                    strokeWidth="1.5"
                  />
                  <rect
                    x="19"
                    y="17"
                    width="962"
                    height="486"
                    rx="13"
                    fill={canvasTheme === "dark" ? "url(#grid-dots-dark)" : "url(#grid-dots-light)"}
                  />

                  {/* Orthogonal Internal Road Corridors */}
                  <path
                    d="M 82 132 L 124 132 L 124 304 L 825 304 M 370 304 L 370 472 L 825 472 L 825 215 L 885 215"
                    fill="none"
                    stroke={canvasTheme === "dark" ? "#131D31" : "#F1F5F9"}
                    strokeWidth="26"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 82 132 L 124 132 L 124 304 L 825 304 M 370 304 L 370 472 L 825 472 L 825 215 L 885 215"
                    fill="none"
                    stroke={canvasTheme === "dark" ? "#1E293B" : "#CBD5E1"}
                    strokeWidth="1"
                    strokeDasharray="6 6"
                  />

                  {/* Density Heatmap Glow on Main Intersections if ON */}
                  {showDensityHeatmap && movingCount > 4 && (
                    <>
                      <circle cx="124" cy="304" r="38" fill="url(#bottleneck-glow)" />
                      <circle cx="370" cy="472" r="32" fill="url(#bottleneck-glow)" />
                    </>
                  )}

                  {/* North Tank Farm Secondary Containment Bund */}
                  <rect
                    x="170"
                    y="56"
                    width="600"
                    height="152"
                    rx="10"
                    fill={canvasTheme === "dark" ? "#0F172A" : "#F8FAFC"}
                    stroke={canvasTheme === "dark" ? "#334155" : "#CBD5E1"}
                    strokeWidth="1.5"
                  />
                  <text
                    x="756"
                    y="72"
                    textAnchor="end"
                    fill={canvasTheme === "dark" ? "#64748B" : "#94A3B8"}
                    fontSize="8.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    NORTH TANK BUND WALL
                  </text>

                  {/* Depot Structural Footprints */}
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
                            fill={
                              isAssembly
                                ? canvasTheme === "dark"
                                  ? "#064E3B"
                                  : "#ECFDF5"
                                : canvasTheme === "dark"
                                ? "#1E293B"
                                : "#F8FAFC"
                            }
                            stroke={
                              isAssembly
                                ? "#10B981"
                                : canvasTheme === "dark"
                                ? "#475569"
                                : "#94A3B8"
                            }
                            strokeWidth={isAssembly ? 2.2 : 1.5}
                          />
                          <circle
                            cx={asset.x}
                            cy={asset.y}
                            r={isAssembly ? r - 6 : r - 8}
                            fill={canvasTheme === "dark" ? "#0B1120" : "#FFFFFF"}
                            stroke={
                              isAssembly
                                ? "#059669"
                                : canvasTheme === "dark"
                                ? "#334155"
                                : "#E2E8F0"
                            }
                            strokeWidth="1"
                          />
                          <text
                            x={asset.x}
                            y={asset.y - 2}
                            textAnchor="middle"
                            fill={canvasTheme === "dark" ? "#F1F5F9" : "#0F172A"}
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
                            fill={
                              isAssembly
                                ? "#34D399"
                                : canvasTheme === "dark"
                                ? "#94A3B8"
                                : "#64748B"
                            }
                            fontSize="8"
                            fontWeight="600"
                            fontFamily="monospace"
                          >
                            {isAssembly ? "SAFE MUSTER" : `${asset.workersPresent} PERS`}
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
                          fill={canvasTheme === "dark" ? "#0F172A" : "#FFFFFF"}
                          stroke={canvasTheme === "dark" ? "#334155" : "#CBD5E1"}
                          strokeWidth="1.4"
                        />
                        {isExit ? (
                          <>
                            <text
                              x={rx + w / 2}
                              y={ry + 18}
                              textAnchor="middle"
                              fill={canvasTheme === "dark" ? "#F1F5F9" : "#0F172A"}
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
                              fill="#10B981"
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
                              fill={canvasTheme === "dark" ? "#1E293B" : "#F8FAFC"}
                              stroke={canvasTheme === "dark" ? "#334155" : "#E2E8F0"}
                              strokeWidth="1"
                            />
                            <text
                              x={rx + 16}
                              y={ry + h / 2 + 3.5}
                              fill={canvasTheme === "dark" ? "#F1F5F9" : "#0F172A"}
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
                              fill={canvasTheme === "dark" ? "#1E293B" : "#F1F5F9"}
                            />
                            <text
                              x={rx + 12}
                              y={ry + 15}
                              fill={canvasTheme === "dark" ? "#F1F5F9" : "#0F172A"}
                              fontSize="9"
                              fontWeight="700"
                              fontFamily="monospace"
                            >
                              {asset.code} · {asset.name.split(" (")[0]}
                            </text>
                            <text
                              x={rx + 12}
                              y={ry + 42}
                              fill={canvasTheme === "dark" ? "#94A3B8" : "#64748B"}
                              fontSize="9"
                            >
                              {asset.capacityOrSpec}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* Pulsing Hazard Zones with Animated Waves */}
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
                            strokeWidth="1.8"
                            className="animate-radar-wave"
                          />
                          {/* Main Plume Cloud */}
                          <circle
                            cx={hz.x}
                            cy={hz.y}
                            r={dynamicRadius}
                            fill={
                              canvasTheme === "dark"
                                ? isGas
                                  ? "url(#plume-gas-dark)"
                                  : "url(#plume-fire-dark)"
                                : isGas
                                ? "url(#plume-gas-light)"
                                : "url(#plume-gas-light)"
                            }
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
                            strokeWidth="1.2"
                            strokeDasharray="3 3"
                            opacity="0.6"
                          />
                          <text
                            x={hz.x}
                            y={hz.y - dynamicRadius - 7}
                            textAnchor="middle"
                            fill={isGas ? "#F87171" : "#FBBF24"}
                            fontSize="9"
                            fontWeight="700"
                            fontFamily="monospace"
                          >
                            HAZARD AGENT: {hz.type.toUpperCase()} ({dynamicRadius}m)
                          </text>
                        </g>
                      );
                    })}

                  {/* AI Explosion Risk Predictor (BLEVE Blast Overpressure Overlays around Tank T-102) */}
                  {showBlastRadiusOverlay && (
                    <g className="pointer-events-none">
                      {/* Lethal Overpressure 48m */}
                      <circle
                        cx={370}
                        cy={125}
                        r={48 * 1.35}
                        fill="rgba(239, 68, 68, 0.08)"
                        stroke="#EF4444"
                        strokeWidth="1.8"
                        strokeDasharray="4 3"
                        className="animate-pulse"
                      />
                      <text
                        x={370}
                        y={125 - 48 * 1.35 - 4}
                        textAnchor="middle"
                        fill="#EF4444"
                        fontSize="7.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        BLEVE LETHAL ZONE (&gt;10 psi · 48m)
                      </text>

                      {/* Structural Damage 88m */}
                      <circle
                        cx={370}
                        cy={125}
                        r={88 * 1.35}
                        fill="rgba(245, 158, 11, 0.04)"
                        stroke="#F59E0B"
                        strokeWidth="1.4"
                        strokeDasharray="6 4"
                      />
                      <text
                        x={370}
                        y={125 - 88 * 1.35 - 4}
                        textAnchor="middle"
                        fill="#F59E0B"
                        fontSize="7.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        STRUCTURAL DAMAGE (&gt;3 psi · 88m)
                      </text>

                      {/* Safe Perimeter 145m */}
                      <circle
                        cx={370}
                        cy={125}
                        r={145 * 1.35}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="1.2"
                        strokeDasharray="8 6"
                      />
                      <text
                        x={370}
                        y={125 - 145 * 1.35 - 4}
                        textAnchor="middle"
                        fill="#10B981"
                        fontSize="7.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        SAFE PERIMETER (&gt;1 psi · 145m)
                      </text>
                    </g>
                  )}

                  {/* Dynamic Digital Variable Message Signs (VMS) on Canvas */}
                  {/* Sign SGN-01 at West Intersection (124, 304) */}
                  <g transform="translate(94, 276)">
                    <rect
                      x="0"
                      y="0"
                      width="60"
                      height="20"
                      rx="4"
                      fill="#0F172A"
                      stroke={isRouteABlockedManually || hazardExpansionStep > 0 ? "#EF4444" : "#10B981"}
                      strokeWidth="1.5"
                    />
                    <text
                      x="30"
                      y="13"
                      textAnchor="middle"
                      fill={isRouteABlockedManually || hazardExpansionStep > 0 ? "#F87171" : "#34D399"}
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {isRouteABlockedManually || hazardExpansionStep > 0 ? "↓ DIVERT B" : "↑ MUSTER A"}
                    </text>
                  </g>

                  {/* Sign SGN-02 at South Intersection (370, 444) */}
                  <g transform="translate(340, 444)">
                    <rect
                      x="0"
                      y="0"
                      width="60"
                      height="20"
                      rx="4"
                      fill="#0F172A"
                      stroke="#10B981"
                      strokeWidth="1.5"
                    />
                    <text
                      x="30"
                      y="13"
                      textAnchor="middle"
                      fill="#34D399"
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      → MUSTER B
                    </text>
                  </g>

                  {/* Evacuation Corridors with Continuous Moving Flow Light Trails */}
                  {/* Route A Path */}
                  <g>
                    <polyline
                      points="124,372 124,132 82,132"
                      fill="none"
                      stroke={isRouteABlockedManually || hazardExpansionStep > 0 ? "#EF4444" : "#10B981"}
                      strokeWidth={isRouteABlockedManually ? 2.5 : 4}
                      strokeDasharray={isRouteABlockedManually ? "4 4" : undefined}
                      strokeLinecap="round"
                    />
                    {!isRouteABlockedManually && hazardExpansionStep === 0 && (
                      <polyline
                        points="124,372 124,132 82,132"
                        fill="none"
                        stroke="#86EFAC"
                        strokeWidth="2.5"
                        strokeDasharray="6 12"
                        strokeLinecap="round"
                        className="animate-route-flow pointer-events-none"
                      />
                    )}
                  </g>

                  {/* Route B Path */}
                  <g>
                    <polyline
                      points="370,304 370,472 530,472"
                      fill="none"
                      stroke={isRouteABlockedManually || hazardExpansionStep > 0 ? "#10B981" : "#F59E0B"}
                      strokeWidth={isRouteABlockedManually || hazardExpansionStep > 0 ? 4 : 3}
                      strokeDasharray={isRouteABlockedManually || hazardExpansionStep > 0 ? undefined : "6 4"}
                      strokeLinecap="round"
                    />
                    {(isRouteABlockedManually || hazardExpansionStep > 0) && (
                      <polyline
                        points="370,304 370,472 530,472"
                        fill="none"
                        stroke="#86EFAC"
                        strokeWidth="2.5"
                        strokeDasharray="6 12"
                        strokeLinecap="round"
                        className="animate-route-flow pointer-events-none"
                      />
                    )}
                  </g>

                  {/* Simulated Moving Worker Agent Dots with Smooth Gliding Translation */}
                  {filteredAgents.map((agent) => {
                    const isSelected = selectedAgentId === agent.id;
                    const isHovered = hoveredAgentId === agent.id;

                    const isInspector = agent.roleLevel === "level-2-inspector" || agent.id === "INSP-01";

                    const fill =
                      agent.status === "evacuated"
                        ? "#10B981"
                        : agent.status === "affected"
                        ? "#EF4444"
                        : isInspector
                        ? "#F59E0B"
                        : agent.status === "diverted"
                        ? "#F59E0B"
                        : "#3B82F6";

                    return (
                      <g
                        key={agent.id}
                        style={{
                          transform: `translate(${agent.x}px, ${agent.y}px)`,
                          transition: isPlaying ? "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Worker Agent ${agent.id} (${agent.name}), status ${agent.status}`}
                        onClick={() => setSelectedAgentId(agent.id)}
                        onMouseEnter={() => setHoveredAgentId(agent.id)}
                        onMouseLeave={() => setHoveredAgentId(null)}
                        className="cursor-pointer"
                      >
                        {/* Trailing motion particles for moving agents */}
                        {(agent.status === "moving" || agent.status === "diverted") && (
                          <g transform={`rotate(${agent.headingDeg})`} className="pointer-events-none opacity-40">
                            <circle cx="-7" cy="0" r="2.2" fill={fill} />
                            <circle cx="-13" cy="0" r="1.4" fill={fill} opacity="0.6" />
                          </g>
                        )}

                        {/* Level 2 Inspector Dedicated High-Vis Halo */}
                        {isInspector && (
                          <>
                            <circle
                              r="15"
                              fill="none"
                              stroke="#F59E0B"
                              strokeWidth="2"
                              className="animate-ping"
                              style={{ animationDuration: "1.8s" }}
                            />
                            <circle
                              r="11"
                              fill="#FEF3C7"
                              stroke="#D97706"
                              strokeWidth="1.8"
                            />
                            <text
                              y="-13"
                              textAnchor="middle"
                              fill={canvasTheme === "dark" ? "#FBBF24" : "#B45309"}
                              fontSize="8"
                              fontWeight="900"
                              fontFamily="monospace"
                            >
                              INSP-01 · SIDAK B
                            </text>
                          </>
                        )}

                        {/* Selected Pulsing Radar Ring */}
                        {isSelected && !isInspector && (
                          <>
                            <circle
                              r="13"
                              fill="none"
                              stroke="#60A5FA"
                              strokeWidth="1.8"
                              className="animate-ping"
                              style={{ animationDuration: "2s" }}
                            />
                            <circle
                              r="10"
                              fill="none"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              strokeDasharray="3 3"
                            />
                          </>
                        )}

                        {/* Affected Panic Indicator */}
                        {agent.status === "affected" && (
                          <circle
                            r="12"
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="1.8"
                            className="animate-ping"
                            style={{ animationDuration: "1.2s" }}
                          />
                        )}

                        {/* Main Agent Core Body */}
                        <circle
                          r={isSelected ? 7 : isInspector ? 6.5 : isHovered ? 6 : 5}
                          fill={fill}
                          stroke="#FFFFFF"
                          strokeWidth="1.6"
                          className="drop-shadow-sm"
                        />

                        {/* Agent Walking Heading Direction Arrow */}
                        {(agent.status === "moving" || agent.status === "diverted") && (
                          <g transform={`rotate(${agent.headingDeg})`}>
                            <polygon points="7,0 3,-2.5 3,2.5" fill="#FFFFFF" />
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Canvas Floating Tooltip for Hovered Worker */}
                  {hoveredAgent && (
                    <g transform={`translate(${hoveredAgent.x}, ${hoveredAgent.y - 28})`} className="pointer-events-none">
                      <rect
                        x="-54"
                        y="-16"
                        width="108"
                        height="20"
                        rx="6"
                        fill="#0F172A"
                        stroke="#334155"
                        strokeWidth="1"
                        className="drop-shadow-lg"
                      />
                      <text
                        x="0"
                        y="-3"
                        textAnchor="middle"
                        fill="#F8FAFC"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {hoveredAgent.id} · {hoveredAgent.name.split(" ")[0]} ({hoveredAgent.speedMps}m/s)
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Bottom Interactive Playback Controls Toolbar */}
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
                        setManualAgentOverrides({});
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
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <ClockIndicator isPlaying={isPlaying} />
                      <span>Clock: T+{simTickSeconds}s / 210s</span>
                    </span>
                    <span>
                      {evacuatedCount} Evacuated ({evacuationRatePct}%) · {affectedCount} In Danger
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={210}
                    step={2}
                    value={simTickSeconds}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setSimTickSeconds(Number(e.target.value));
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>T+0s (Alarm)</span>
                    <span>T+45s (Corridor Influx)</span>
                    <span>T+90s (Peak Density)</span>
                    <span>T+150s (Muster Arrival)</span>
                    <span>T+210s (Target Clearance)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Distribution & Role Level Filter Tabs */}
            <div className="bg-white p-3.5 border border-slate-200/90 rounded-2xl shadow-xs space-y-2.5">
              {/* Row 1: Status Filter */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
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
                    Safe at Muster ({evacuatedCount})
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
                  {filteredAgents.length} agen ditampilkan
                </span>
              </div>

              {/* Row 2: Role Level Filter */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 mr-1">Level Otoritas:</span>
                <button
                  type="button"
                  onClick={() => setRoleLevelFilter("all")}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    roleLevelFilter === "all"
                      ? "bg-slate-800 text-white border-slate-800 font-semibold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Semua Level
                </button>
                <button
                  type="button"
                  onClick={() => setRoleLevelFilter("level-1-operator")}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    roleLevelFilter === "level-1-operator"
                      ? "bg-blue-600 text-white border-blue-600 font-semibold"
                      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  Level 1: Operator
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleLevelFilter("level-2-inspector");
                    setSelectedAgentId("INSP-01");
                  }}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    roleLevelFilter === "level-2-inspector"
                      ? "bg-amber-500 text-white border-amber-600 font-bold shadow-xs"
                      : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                  }`}
                >
                  Level 2: Inspektur K3 (Sidak Lapangan B)
                </button>
                <button
                  type="button"
                  onClick={() => setRoleLevelFilter("level-3-manager")}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    roleLevelFilter === "level-3-manager"
                      ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                  }`}
                >
                  Level 3: Manager
                </button>
                <button
                  type="button"
                  onClick={() => setRoleLevelFilter("level-4-ert")}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    roleLevelFilter === "level-4-ert"
                      ? "bg-rose-600 text-white border-rose-600 font-semibold"
                      : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  }`}
                >
                  Level 4: ERT
                </button>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Live Selected Agent Inspector & Scenario Controls */}
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
                            : selectedAgent.status === "diverted"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedAgent.status === "evacuated"
                              ? "bg-emerald-500"
                              : selectedAgent.status === "affected"
                              ? "bg-rose-500"
                              : selectedAgent.status === "diverted"
                              ? "bg-amber-500"
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

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        selectedAgent.roleLevel === "level-2-inspector"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : selectedAgent.roleLevel === "level-3-manager"
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : selectedAgent.roleLevel === "level-4-ert"
                          ? "bg-rose-100 text-rose-900 border border-rose-300"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {selectedAgent.roleLevel === "level-2-inspector"
                          ? "LEVEL 2: INSPEKTUR K3 (SIDAK)"
                          : selectedAgent.roleLevel === "level-3-manager"
                          ? "LEVEL 3: DEPOT MANAGER"
                          : selectedAgent.roleLevel === "level-4-ert"
                          ? "LEVEL 4: ERT RESPONDER"
                          : "LEVEL 1: OPERATOR"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Pos: {selectedAgent.originZone}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono">Heart Rate</span>
                    <div className="flex items-center justify-end gap-1 text-sm font-mono font-bold text-rose-600 mt-0.5">
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                      <span>{selectedAgent.heartRate} bpm</span>
                    </div>
                  </div>
                </div>

                {/* Level 2 Inspector Inspection Notice */}
                {selectedAgent.roleLevel === "level-2-inspector" && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Protokol Khusus Sidak Lapangan B (Side B)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      Inspektur sedang menyidak operasional di Gantry Bay B. Jika terdeteksi kebocoran gas di koridor manifold PIPE-01, jalur evakuasi utara terputus. Sistem mengunci arah evakuasi ke <strong>Koridor Selatan (Route B) menuju AP-BRAVO</strong>.
                    </p>
                  </div>
                )}

                {/* Agent Real-Time Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">CURRENT ROUTE</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {selectedAgent.assignedRoute}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">TARGET MUSTER</span>
                    <span className="font-bold text-emerald-700 mt-0.5 block">
                      {selectedAgent.targetMuster}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">CURRENT SPEED</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {selectedAgent.speedMps} m/s
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">DISTANCE REMAINING</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {selectedAgent.distanceRemainingM} meters
                    </span>
                  </div>
                </div>

                {/* Progress Bar to Safety */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Progress to Safe Muster</span>
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

                {/* Interactive Direct Re-route Button for Selected Worker */}
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleManualRerouteAgent(selectedAgent.id)}
                    className="w-full cursor-pointer text-xs"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    <span>
                      {selectedAgent.targetMuster === "AP-ALPHA"
                        ? "Manually Re-Route to Muster Bravo"
                        : "Manually Re-Route to Muster Alpha"}
                    </span>
                  </Button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Start: {selectedAgent.originZone}</span>
                  <span className="font-mono">
                    Coord: ({selectedAgent.x}, {selectedAgent.y})
                  </span>
                </div>
              </section>
            )}

            {/* Scenario Configuration Card */}
            <section
              aria-labelledby="sim-parameters-heading"
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4"
            >
              <h2
                id="sim-parameters-heading"
                className="text-sm font-bold text-slate-900 flex items-center gap-2"
              >
                <Sliders className="w-4 h-4 text-slate-700" />
                <span>Scenario & Cohort Controls</span>
              </h2>

              <div>
                <label
                  htmlFor="scenario-select-input"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  Select Incident Scenario:
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
                    Depot Workforce Size:
                  </label>
                  <span className="font-mono text-blue-600">{workerCount} Personnel</span>
                </div>
                <input
                  id="worker-count-slider"
                  type="range"
                  min={12}
                  max={42}
                  step={2}
                  value={workerCount}
                  onChange={(e) => setWorkerCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>12 (Skeleton Crew)</span>
                  <span>28 (Shift A)</span>
                  <span>42 (Full Operating Shift)</span>
                </div>
              </div>
            </section>

            {/* 4-Component Multi-Agent Methodology Architecture */}
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
                    <span>1. Worker Agents ({simulatedAgents.length} Active Personnel)</span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Continuous physical agent movement along orthogonal road networks with individualized walking speeds and heart-rate stress response.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    <span>2. Hazard Agents ({hazards.filter((h) => h.active).length} Plumes)</span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Expanding multi-hazard dispersion model of gasoline vapor (% LEL), thermal radiation (°C), and smoke opacity drifting SE with wind.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3. Safety Agents (Threshold Gate)</span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Continuously checks corridor risk scores against threshold 65/100, blocking hazardous corridors instantly upon vapor breach.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <Waypoints className="w-3.5 h-3.5 text-amber-600" />
                    <span>4. Routing Agents (Dynamic Guidance)</span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Optimizes corridor choice across distance, exposure, and congestion, updating electronic field signage in under 300 ms.
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

function ClockIndicator({ isPlaying }: { isPlaying: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {isPlaying && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex rounded-full h-2 w-2 ${
          isPlaying ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
    </span>
  );
}
