export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type SensorType = "temperature" | "gas" | "smoke" | "fire" | "wind";

export type SensorStatus = "normal" | "warning" | "critical" | "offline";

export type AgentType = "worker" | "hazard" | "safety" | "routing";

export type RouteStatus = "recommended" | "alternative" | "blocked";

export type UIViewState = "ready" | "loading" | "empty" | "error";

export interface Point2D {
  x: number;
  y: number;
}

export interface FacilityAsset {
  id: string;
  facilityId: string;
  name: string;
  code: string;
  category:
    | "tank"
    | "loading_bay"
    | "pipe_corridor"
    | "operations_building"
    | "restricted_zone"
    | "emergency_exit"
    | "assembly_point";
  shape: "circle" | "rect";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  capacityOrSpec: string;
  riskStatus: RiskLevel;
  workersPresent: number;
  description: string;
}

export interface SensorReadingPoint {
  time: string;
  value: number;
}

export interface Sensor {
  id: string;
  facilityId: string;
  name: string;
  type: SensorType;
  location: string;
  zoneId: string;
  x: number;
  y: number;
  value: number;
  baselineValue: number;
  unit: string;
  warningThreshold: number;
  criticalThreshold: number;
  status: SensorStatus;
  lastUpdated: string;
  windDirectionDeg?: number;
  windDirectionCardinal?: string;
  history: SensorReadingPoint[];
}

export interface HazardZone {
  id: string;
  facilityId: string;
  name: string;
  type: "gas" | "fire" | "smoke" | "heat";
  severity: RiskLevel;
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  expandedRadius: number;
  plumeAngleDeg: number;
  affectedArea: string;
  description: string;
  active: boolean;
}

export interface EvacuationRoute {
  id: string;
  facilityId: string;
  name: string;
  shortCode: string;
  originZone: string;
  destinationAssemblyId: string;
  destinationName: string;
  corridorDescription: string;
  waypoints: Point2D[];
  distanceMeters: number;
  estimatedTimeSeconds: number;
  riskScore: number;
  hazardExposure: number;
  densityScore: number;
  accessible: boolean;
  accessibilityNote: string;
  status: RouteStatus;
  explanation: string;
  signageNodeId: string;
  signageLocation: string;
  signageDirection: "NORTH-WEST" | "SOUTH-EAST" | "EAST" | "WEST";
  scoreBreakdown: {
    distanceContribution: number;
    exposureContribution: number;
    densityContribution: number;
    accessibilityPenalty: number;
  };
}

export interface WorkerAgent {
  id: string;
  facilityId: string;
  label: string;
  role: string;
  originZone: string;
  x: number;
  y: number;
  originX: number;
  originY: number;
  assignedRouteId: string;
  speedMetersPerSec: number;
  responseDelaySec: number;
  status: "moving" | "waiting" | "evacuated" | "affected";
  progress: number;
}

export interface SafetyAlert {
  id: string;
  facilityId: string;
  title: string;
  description: string;
  severity: RiskLevel;
  timestamp: string;
  location: string;
  targetX: number;
  targetY: number;
  sensorId?: string;
  hazardId?: string;
  acknowledged: boolean;
}

export interface TimelineEvent {
  id: string;
  facilityId: string;
  timestamp: string;
  category: "sensor" | "twin" | "simulation" | "evacuation" | "operator";
  title: string;
  detail: string;
}

export interface ApproachComparisonMetric {
  method: "Static Signage" | "Shortest-Route Method" | "EVORA Adaptive Recommendation";
  evacuationTimeSec: number;
  hazardExposureIndex: number;
  routeSafetyScore: number;
  peakWorkerDensity: number;
  guidanceLatencyMs: number;
  notes: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  code: string;
  category: "gas_leakage" | "tank_fire" | "smoke_propagation";
  severity: RiskLevel;
  description: string;
  triggerSummary: string;
  windSpeedMps: number;
  windDirectionDeg: number;
  windDirectionLabel: string;
  defaultWorkerCount: number;
  hazardOverrides: {
    hazardId: string;
    radiusMultiplier: number;
    severity: RiskLevel;
    active: boolean;
  }[];
  sensorOverrides: {
    sensorId: string;
    value: number;
    status: SensorStatus;
  }[];
  comparisonMetrics: ApproachComparisonMetric[];
}

export interface SimulatedIncident {
  id: string;
  facilityId: string;
  code: string;
  timestamp: string;
  scenarioId: string;
  scenarioName: string;
  location: string;
  severity: RiskLevel;
  status: "Active Demo Scenario" | "Completed Simulation" | "Baseline Drill";
  summary: string;
  timeline: {
    time: string;
    actor: "IoT Telemetry" | "Digital Twin" | "Multi-Agent Sim" | "Routing Engine" | "HSE Operator";
    event: string;
  }[];
  outcomeMetrics: {
    evacuatedWorkers: number;
    totalWorkers: number;
    avgEvacuationTimeSec: number;
    peakExposureScore: number;
    blockedRoutesCount: number;
    signageUpdateLatencyMs: number;
  };
}

export interface FacilityInfo {
  id: string;
  name: string;
  code: string;
  region: string;
  typeDescription: string;
  statusBannerText: string;
  overallRisk: RiskLevel;
  totalWorkers: number;
  evacuationReadinessPct: number;
  windSpeedMps: number;
  windDirectionDeg: number;
  windDirectionLabel: string;
}

export interface RouteScoringConfig {
  distanceWeight: number;
  exposureWeight: number;
  densityWeight: number;
  accessibilityWeight: number;
  riskThreshold: number;
}

export type UserRoleLevel =
  | "level-1-operator"
  | "level-2-inspector"
  | "level-3-manager"
  | "level-4-ert";

export interface StationaryPostEvacuation {
  id: string;
  name: string;
  zone: string;
  shortCode: string;
  totalPersonnel: number;
  personnelLevelsPresent: UserRoleLevel[];
  currentRisk: RiskLevel;
  evacuationCorridor: string;
  destinationAssembly: string;
  distanceMeters: number;
  estimatedEscapeTimeSec: number;
  specialLevelGuidance: Record<UserRoleLevel, string>;
  status: "safe" | "evacuating" | "cleared" | "at_risk";
  gateAccessStatus: "OPEN" | "RESTRICTED" | "DIVERTED";
}

export interface AIExplosionPrediction {
  facilityId: string;
  targetAssetId: string;
  targetAssetName: string;
  tankProduct: string;
  explosionType: "BLEVE (Boiling Liquid Expanding Vapor Explosion)" | "VCE (Vapor Cloud Explosion)" | "Flash Fire";
  probabilityPct: number;
  threatLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "NOMINAL";
  estimatedTimeToFailureSeconds: number;
  blastWaveRadii: {
    lethalOverpressureMeters: number;
    structuralDamageMeters: number;
    glassBreakageMeters: number;
  };
  telemetryFactors: {
    shellTemperatureC: number;
    internalPressureBar: number;
    vaporHeadLelPct: number;
    reliefValveVentingKgS: number;
    acousticMicroStressDb: number;
  };
  mitigationActions: {
    id: string;
    title: string;
    description: string;
    status: "recommended" | "executing" | "completed";
    autoDeployable: boolean;
  }[];
}

