export type TwinScenarioId =
  | "normal"
  | "gas-leak"
  | "fire"
  | "smoke"
  | "gas-wind";

export type TwinStatus = "Normal" | "Warning" | "Critical";

export type TwinCategory =
  | "Storage Tank"
  | "Loading & Unloading"
  | "Pumping Station"
  | "Operational Building"
  | "Utility Facility"
  | "Emergency Exit"
  | "Assembly Point";

export type TwinSensorType =
  | "gas"
  | "temperature"
  | "smoke"
  | "fire"
  | "wind";

export type CameraPresetId =
  | "overview"
  | "storage"
  | "loading"
  | "pumping"
  | "control-room";

export interface CameraPreset {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  description: string;
}

export interface TwinFacilityObject {
  id: string;
  code: string;
  name: string;
  category: TwinCategory;
  zone: string;
  position: [number, number, number];
  /** Used for cylinder radius/height or box dimensions [w, h, d] */
  shape: "cylinder" | "horizontal-cylinder" | "box";
  dimensions: [number, number, number];
  rotationY?: number;
  productOrSpec: string;
  description: string;
  sensorIds: string[];
  baseHazardNote: string;
}

export interface TwinSensorNode {
  id: string;
  code: string;
  name: string;
  type: TwinSensorType;
  installationArea: string;
  position: [number, number, number];
  unit: string;
  baseValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  windDirectionDeg?: number;
  windLabel?: string;
}

export interface HazardZoneSpec {
  id: string;
  label: string;
  type: "gas" | "fire" | "smoke";
  severity: "Moderate" | "High" | "Critical";
  center: [number, number, number];
  radius: number;
  height: number;
  /** Optional downwind elongation along [dx, dz] in 3D space */
  windStretch?: {
    dx: number;
    dz: number;
    lengthMultiplier: number;
  };
  affectedSummary: string;
}

export interface TwinScenarioConfig {
  id: TwinScenarioId;
  name: string;
  shortLabel: string;
  incidentLocation: string;
  severity: "Nominal" | "Elevated" | "High" | "Critical";
  windSpeedMps: number;
  windDirectionDeg: number;
  windDirectionLabel: string;
  summary: string;
  environmentalNote: string;
  hazards: HazardZoneSpec[];
  sensorOverrides: Record<string, { value: number; status: TwinStatus }>;
  assetOverrides: Record<
    string,
    { status: TwinStatus; hazardNote: string }
  >;
  /** Conceptual route edge classifications */
  blockedEdgeIds: string[];
  cautionEdgeIds: string[];
  recommendedRoutePaths: {
    id: string;
    label: string;
    originLabel: string;
    destinationLabel: string;
    waypoints: [number, number, number][];
    riskScore: number;
    distanceM: number;
    status: "recommended" | "caution" | "blocked" | "normal";
  }[];
}

export interface DepotNavNode {
  id: string;
  label: string;
  kind: "worker-start" | "junction" | "exit" | "assembly";
  position: [number, number, number];
  workerGroup?: string;
  workerCount?: number;
}

export interface DepotNavEdge {
  id: string;
  from: string;
  to: string;
  name: string;
  distanceM: number;
  waypoints: [number, number, number][];
}

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: "overview",
    label: "Overview",
    position: [34, 26, 34],
    target: [0, 0.5, -1],
    description: "Full isometric depot view",
  },
  {
    id: "storage",
    label: "Storage Area",
    position: [7, 15, 22],
    target: [-8.5, 1.5, 2],
    description: "Bunded cylindrical tank farms (T-101 to T-115)",
  },
  {
    id: "loading",
    label: "Loading Area",
    position: [20, 12, 18],
    target: [5.5, 1.2, 6.5],
    description: "Canopy loading gantry, tanker trucks & transfer racks",
  },
  {
    id: "pumping",
    label: "Pumping Station",
    position: [14, 11, 25],
    target: [1, 1.2, 14.5],
    description: "Main pumping manifold & booster skid station",
  },
  {
    id: "control-room",
    label: "Control Room",
    position: [13, 12, 1],
    target: [-1, 1.4, -7],
    description: "Central control building & instrumentation hub",
  },
];

/**
 * 15 Cylindrical Storage Tanks matching the attached isometric engineering diagram:
 * - South Containment Bund (6 vertical cylindrical tanks: T-101..T-106)
 * - North Containment Bund (6 vertical cylindrical tanks: T-107..T-112)
 * - Vapor Recovery & Buffer Bund (3 horizontal cylindrical vessels: T-113..T-115)
 */
export const DEPOT_TANKS: TwinFacilityObject[] = [
  // South Tank Farm Bund (x: -14..-2, z: 3.5..15.5)
  {
    id: "T-101",
    code: "T-101",
    name: "Storage Tank T-101 (Pertalite RON 90)",
    category: "Storage Tank",
    zone: "South Tank Bund A",
    position: [-12.2, 0, 12.6],
    shape: "cylinder",
    dimensions: [2.15, 3.2, 2.15],
    productOrSpec: "15,000 KL Floating-Roof Vertical Tank",
    description: "Primary Pertalite RON 90 storage tank near south-west bund perimeter.",
    sensorIds: ["SNS-GAS-01", "SNS-FLM-01"],
    baseHazardNote: "Floating roof seal integrity nominal under standard vapor balancing.",
  },
  {
    id: "T-102",
    code: "T-102",
    name: "Storage Tank T-102 (Pertamax RON 92)",
    category: "Storage Tank",
    zone: "South Tank Bund A",
    position: [-7.6, 0, 12.6],
    shape: "cylinder",
    dimensions: [2.15, 3.2, 2.15],
    productOrSpec: "15,000 KL Floating-Roof Vertical Tank",
    description: "High-octane Pertamax storage tank adjacent to central manifold feed line.",
    sensorIds: ["SNS-TMP-01", "SNS-GAS-02", "SNS-FLM-01"],
    baseHazardNote: "Primary tank connected to central pump header; closely monitored for vapor seal & thermal stress.",
  },
  {
    id: "T-103",
    code: "T-103",
    name: "Storage Tank T-103 (Pertamax Turbo)",
    category: "Storage Tank",
    zone: "South Tank Bund A",
    position: [-12.2, 0, 7.6],
    shape: "cylinder",
    dimensions: [2.15, 3.2, 2.15],
    productOrSpec: "12,500 KL Internal Floating Roof Tank",
    description: "Specialty high-octane motor fuel tank on west bund alignment.",
    sensorIds: ["SNS-GAS-01"],
    baseHazardNote: "Vapor pressure & rim-seal temperature within operating envelope.",
  },
  {
    id: "T-104",
    code: "T-104",
    name: "Storage Tank T-104 (Pertalite Header)",
    category: "Storage Tank",
    zone: "South Tank Bund A",
    position: [-7.6, 0, 7.6],
    shape: "cylinder",
    dimensions: [2.15, 3.2, 2.15],
    productOrSpec: "15,000 KL Fixed-Roof with Blanketing",
    description: "Distribution feeder tank routing directly to South Pumping Station.",
    sensorIds: ["SNS-TMP-01", "SNS-SMK-01"],
    baseHazardNote: "Nitrogen blanketing active; transfer manifold valves closed on standby.",
  },
  {
    id: "T-105",
    code: "T-105",
    name: "Storage Tank T-105 (Bio-Solar B35)",
    category: "Storage Tank",
    zone: "South Tank Bund A",
    position: [-3.2, 0, 12.6],
    shape: "cylinder",
    dimensions: [2.05, 3.0, 2.05],
    productOrSpec: "12,000 KL Cone-Roof Vertical Tank",
    description: "Middle distillate automotive diesel storage tank facing south pumping manifold.",
    sensorIds: ["SNS-TMP-02"],
    baseHazardNote: "Low vapor pressure distillate; monitored for external radiant heat exposure.",
  },
  {
    id: "T-106",
    code: "T-106",
    name: "Storage Tank T-106 (Bio-Solar B35)",
    category: "Storage Tank",
    zone: "South Tank Bund A",
    position: [-3.2, 0, 7.6],
    shape: "cylinder",
    dimensions: [2.05, 3.0, 2.05],
    productOrSpec: "12,000 KL Cone-Roof Vertical Tank",
    description: "East-side diesel reserve feeding road tanker gantry islands.",
    sensorIds: ["SNS-SMK-01"],
    baseHazardNote: "Foam chamber standby verified; perimeter dike drain valve locked shut.",
  },

  // North Tank Farm Bund (x: -14..-2, z: -11.5..0.5)
  {
    id: "T-107",
    code: "T-107",
    name: "Storage Tank T-107 (Avtur Jet A-1)",
    category: "Storage Tank",
    zone: "North Tank Bund B",
    position: [-12.2, 0, -2.0],
    shape: "cylinder",
    dimensions: [2.15, 3.2, 2.15],
    productOrSpec: "10,000 KL Epoxy-Lined Cone Roof Tank",
    description: "Aviation turbine fuel storage tank with floating suction line.",
    sensorIds: ["SNS-GAS-03"],
    baseHazardNote: "Static dissipative aviation grade storage; grounded perimeter ring verified.",
  },
  {
    id: "T-108",
    code: "T-108",
    name: "Storage Tank T-108 (Avtur Jet A-1)",
    category: "Storage Tank",
    zone: "North Tank Bund B",
    position: [-7.6, 0, -2.0],
    shape: "cylinder",
    dimensions: [2.15, 3.2, 2.15],
    productOrSpec: "10,000 KL Epoxy-Lined Cone Roof Tank",
    description: "Secondary aviation fuel reserve linked to central pipe manifold.",
    sensorIds: ["SNS-FLM-02", "SNS-TMP-03"],
    baseHazardNote: "Monitored by Bund B thermal & optical flame sensors.",
  },
  {
    id: "T-109",
    code: "T-109",
    name: "Storage Tank T-109 (Pertamax RON 92)",
    category: "Storage Tank",
    zone: "North Tank Bund B",
    position: [-3.2, 0, -2.0],
    shape: "cylinder",
    dimensions: [2.05, 3.0, 2.05],
    productOrSpec: "12,500 KL Floating-Roof Vertical Tank",
    description: "East tank of North Bund adjacent to pump house transfer bridge.",
    sensorIds: ["SNS-GAS-02", "SNS-SMK-02"],
    baseHazardNote: "Downwind proximity to control & gantry pipe rack corridor.",
  },
  {
    id: "T-110",
    code: "T-110",
    name: "Storage Tank T-110 (Pertalite RON 90)",
    category: "Storage Tank",
    zone: "North Tank Bund B",
    position: [-12.2, 0, -7.2],
    shape: "cylinder",
    dimensions: [2.15, 3.2, 2.15],
    productOrSpec: "15,000 KL Floating-Roof Vertical Tank",
    description: "North-west tank adjacent to rail/pipeline transfer rack.",
    sensorIds: ["SNS-GAS-03", "SNS-WND-01"],
    baseHazardNote: "Upwind anchor tank under coastal south-east wind vectors.",
  },
  {
    id: "T-111",
    code: "T-111",
    name: "Storage Tank T-111 (Industrial Diesel)",
    category: "Storage Tank",
    zone: "North Tank Bund B",
    position: [-7.6, 0, -7.2],
    shape: "cylinder",
    dimensions: [2.15, 3.2, 2.15],
    productOrSpec: "12,000 KL Cone-Roof Vertical Tank",
    description: "Marine & industrial fuel oil reserve tank.",
    sensorIds: ["SNS-TMP-03"],
    baseHazardNote: "Level radar telemetry online; bund firewall intact.",
  },
  {
    id: "T-112",
    code: "T-112",
    name: "Storage Tank T-112 (Reserve Distillate)",
    category: "Storage Tank",
    zone: "North Tank Bund B",
    position: [-3.2, 0, -7.2],
    shape: "cylinder",
    dimensions: [2.05, 3.0, 2.05],
    productOrSpec: "10,000 KL Insulated Vertical Tank",
    description: "North-east bund tank connected to gantry distribution headers.",
    sensorIds: ["SNS-SMK-02"],
    baseHazardNote: "Deluge ring pre-wetting lines clear and pressurized.",
  },

  // Auxiliary Horizontal Process & Vapor Recovery Cylindrical Vessels (3 tanks = 15 total!)
  {
    id: "T-113",
    code: "T-113",
    name: "Buffer Vessel V-113 (Vapor Condensate)",
    category: "Storage Tank",
    zone: "VRU Process Pad",
    position: [2.6, 0, -10.2],
    shape: "horizontal-cylinder",
    dimensions: [0.85, 2.6, 0.85],
    rotationY: Math.PI / 4,
    productOrSpec: "60 KL Horizontal Pressurized Drum",
    description: "Horizontal cylindrical condensate storage vessel serving the Vapor Recovery Unit.",
    sensorIds: ["SNS-GAS-04"],
    baseHazardNote: "Pressurized hydrocarbon vapor condensate buffer drum.",
  },
  {
    id: "T-114",
    code: "T-114",
    name: "Buffer Vessel V-114 (Slop & Drain)",
    category: "Storage Tank",
    zone: "VRU Process Pad",
    position: [4.7, 0, -10.2],
    shape: "horizontal-cylinder",
    dimensions: [0.85, 2.6, 0.85],
    rotationY: Math.PI / 4,
    productOrSpec: "60 KL Horizontal Slop Tank",
    description: "Recovered oily water and slop hydrocarbon buffer vessel.",
    sensorIds: ["SNS-GAS-04"],
    baseHazardNote: "High-level interlock monitored continuously.",
  },
  {
    id: "T-115",
    code: "T-115",
    name: "Firewater Surge Vessel V-115",
    category: "Storage Tank",
    zone: "VRU Process Pad",
    position: [6.8, 0, -10.2],
    shape: "horizontal-cylinder",
    dimensions: [0.85, 2.6, 0.85],
    rotationY: Math.PI / 4,
    productOrSpec: "80 KL Pressurized Foam/Water Drum",
    description: "Pressurized foam-concentrate and deluge booster surge vessel.",
    sensorIds: ["SNS-TMP-03"],
    baseHazardNote: "Maintains 7.5 bar readiness pressure for depot deluge system.",
  },
];

export const DEPOT_FACILITIES: TwinFacilityObject[] = [
  {
    id: "PUMP-MAIN",
    code: "PS-01",
    name: "South Main Pumping Station",
    category: "Pumping Station",
    zone: "South Transfer Manifold",
    position: [2.6, 0, 13.8],
    shape: "box",
    dimensions: [3.4, 1.5, 2.2],
    productOrSpec: "4 x 450 m³/hr Centrifugal Transfer Pumps",
    description: "Primary booster and transfer pumping station linking storage bund manifolds to loading racks.",
    sensorIds: ["SNS-GAS-02", "SNS-TMP-01", "SNS-FLM-01"],
    baseHazardNote: "High-pressure mechanical seals & flange headers monitored for hydrocarbon leakage.",
  },
  {
    id: "PUMP-BOOSTER",
    code: "PS-02",
    name: "Central Manifold & Skids",
    category: "Pumping Station",
    zone: "Central Transfer Corridor",
    position: [-2.2, 0, -14.2],
    shape: "box",
    dimensions: [4.2, 1.2, 2.8],
    productOrSpec: "3 x Custody Metering & Booster Skids",
    description: "Secondary pipeline booster pumps receiving intake from the north pipe/rail transfer rack.",
    sensorIds: ["SNS-GAS-03", "SNS-FLM-02"],
    baseHazardNote: "Automated Emergency Shutdown (ESD) motor-operated valves online.",
  },
  {
    id: "LOAD-GANTRY",
    code: "LB-01",
    name: "Tanker Loading & Unloading Gantry",
    category: "Loading & Unloading",
    zone: "East Loading Zone (Blue Pad)",
    position: [6.8, 0, 3.8],
    shape: "box",
    dimensions: [6.4, 2.8, 4.4],
    productOrSpec: "4-Bay Bottom Loading Canopy + Tanker Arms",
    description: "Primary road tanker loading/unloading island with overfill grounding interlocks and vapor recovery arms.",
    sensorIds: ["SNS-TMP-02", "SNS-SMK-03", "SNS-FLM-03"],
    baseHazardNote: "Active fuel tanker loading zone; high personnel occupancy during dispatch windows.",
  },
  {
    id: "LOAD-METERING",
    code: "LB-02",
    name: "Gantry Metering & Additive Island",
    category: "Loading & Unloading",
    zone: "South-East Loading Zone",
    position: [5.0, 0, 9.6],
    shape: "box",
    dimensions: [4.8, 1.4, 2.6],
    productOrSpec: "Custody Flow Meters & Dye/Additive Injection",
    description: "Loading platform utility booths and metering skids serving Tanker Bays.",
    sensorIds: ["SNS-GAS-04", "SNS-TMP-02"],
    baseHazardNote: "Direct access route to East Perimeter Road and Assembly Point Bravo.",
  },
  {
    id: "BLD-CTRL",
    code: "CTRL-01",
    name: "Depot Control Room (Blast-Resistant)",
    category: "Operational Building",
    zone: "Central Command Hub",
    position: [-6.8, 0, -14.5],
    shape: "box",
    dimensions: [6.2, 2.5, 3.6],
    productOrSpec: "SCADA, ESD Matrix & EVORA Edge Server",
    description: "Positive-pressure control room monitoring tank gauging, pump ESD, and EVORA evacuation routing.",
    sensorIds: ["SNS-SMK-02", "SNS-WND-01"],
    baseHazardNote: "Designated hardened command hub with HVAC smoke damper isolation.",
  },
  {
    id: "BLD-OPS",
    code: "OPS-01",
    name: "Operational Office & Dispatch Hall",
    category: "Operational Building",
    zone: "North-East Entrance Sector",
    position: [10.8, 0, -14.8],
    shape: "box",
    dimensions: [5.6, 2.4, 3.4],
    productOrSpec: "HSE Office, Driver Briefing & Gate Control",
    description: "Administration office and road-tanker dispatch check-in center near north staging lot.",
    sensorIds: ["SNS-SMK-02"],
    baseHazardNote: "Low fire-load administrative structure adjacent to North Dispatch Exit.",
  },
  {
    id: "BLD-MAINT",
    code: "MNT-01",
    name: "Maintenance & Instrument Workshop",
    category: "Operational Building",
    zone: "East Industrial Corridor",
    position: [13.5, 0, 5.2],
    shape: "box",
    dimensions: [3.8, 2.4, 7.6],
    productOrSpec: "Valve Calibration, Mechanical Bay & Tool Crib",
    description: "Facility mechanical maintenance hangar and Ex-certified instrument calibration bay.",
    sensorIds: ["SNS-SMK-03"],
    baseHazardNote: "Hot-work permit strictly controlled; separated from tank bunds by east road.",
  },
  {
    id: "BLD-UTIL",
    code: "UTL-01",
    name: "Utility, Firewater & Cooling Complex",
    category: "Utility Facility",
    zone: "East Utility Pads",
    position: [13.5, 0, -4.8],
    shape: "box",
    dimensions: [4.0, 2.8, 7.4],
    productOrSpec: "2x Induced-Draft Cooling Units + Foam Powerhouse",
    description: "Depot utility cooling towers, instrument air compressors, and emergency generator sets.",
    sensorIds: ["SNS-TMP-03", "SNS-WND-02"],
    baseHazardNote: "Critical power & firewater supply infrastructure.",
  },
  {
    id: "EXIT-W1",
    code: "EX-W1",
    name: "Emergency Exit West (Gate W1)",
    category: "Emergency Exit",
    zone: "West Perimeter Road",
    position: [-16.8, 0, 14.5],
    shape: "box",
    dimensions: [1.6, 1.8, 1.2],
    productOrSpec: "2.8m Panic-Bar Egress Gate",
    description: "Primary upwind emergency pedestrian exit leading directly to Assembly Point Alpha.",
    sensorIds: ["SNS-WND-01"],
    baseHazardNote: "Unlocked fail-safe gate connected to EVORA dynamic LED signage.",
  },
  {
    id: "EXIT-S2",
    code: "EX-S2",
    name: "Emergency Exit South-East (Gate S2)",
    category: "Emergency Exit",
    zone: "South-East Perimeter",
    position: [12.5, 0, 16.5],
    shape: "box",
    dimensions: [1.8, 1.8, 1.2],
    productOrSpec: "3.5m Dual Egress & ERT Access Gate",
    description: "South-east egress portal leading to Assembly Point Bravo and fire tender staging.",
    sensorIds: ["SNS-SMK-03"],
    baseHazardNote: "Clear approach road shielded by Maintenance Workshop & East Utility berm.",
  },
  {
    id: "EXIT-N3",
    code: "EX-N3",
    name: "North Dispatch Emergency Gate (Gate N3)",
    category: "Emergency Exit",
    zone: "North Dispatch Apron",
    position: [13.2, 0, -21.0],
    shape: "box",
    dimensions: [2.2, 1.8, 1.2],
    productOrSpec: "Main Dispatch Gate / Emergency Diversion",
    description: "Northern egress route serving Operational Office, Control Room, and Truck Staging.",
    sensorIds: ["SNS-WND-02"],
    baseHazardNote: "Diverts incoming road tankers away from incident perimeter during alarms.",
  },
  {
    id: "AP-ALPHA",
    code: "AP-ALPHA",
    name: "Assembly Point Alpha (West Upwind)",
    category: "Assembly Point",
    zone: "Outside West Safe Boundary",
    position: [-20.5, 0, 14.5],
    shape: "box",
    dimensions: [3.6, 0.4, 3.6],
    productOrSpec: "Capacity: 60 Personnel · First-Aid Shelter",
    description: "Primary upwind muster zone protected from prevailing SE coastal wind dispersion.",
    sensorIds: ["SNS-WND-01"],
    baseHazardNote: "Verified outside modeled hydrocarbon vapor & radiant heat hazard contours.",
  },
  {
    id: "AP-BRAVO",
    code: "AP-BRAVO",
    name: "Assembly Point Bravo (South-East Zone)",
    category: "Assembly Point",
    zone: "Outside South-East Boundary",
    position: [16.8, 0, 16.5],
    shape: "box",
    dimensions: [3.6, 0.4, 3.6],
    productOrSpec: "Capacity: 50 Personnel · ERT Staging",
    description: "Secondary safe muster area serving Loading Gantry, Maintenance, and South Pump crews.",
    sensorIds: ["SNS-SMK-03"],
    baseHazardNote: "Clear downwind bypass corridor via East Perimeter Road.",
  },
  {
    id: "AP-CHARLIE",
    code: "AP-CHARLIE",
    name: "Assembly Point Charlie (North Gate)",
    category: "Assembly Point",
    zone: "Outside North Dispatch Lot",
    position: [17.8, 0, -21.0],
    shape: "box",
    dimensions: [3.6, 0.4, 3.6],
    productOrSpec: "Capacity: 45 Personnel · Visitor Muster",
    description: "Northern safe muster station for Control Room, Office, and Tanker Staging staff.",
    sensorIds: ["SNS-WND-02"],
    baseHazardNote: "Primary evacuation destination when south & central corridors experience smoke/gas drift.",
  },
];

export const ALL_TWIN_ENTITIES: TwinFacilityObject[] = [
  ...DEPOT_TANKS,
  ...DEPOT_FACILITIES,
];

export const TWIN_SENSORS: TwinSensorNode[] = [
  // Gas Detectors (Yellow)
  {
    id: "SNS-GAS-01",
    code: "GS-201",
    name: "Hydrocarbon Gas Detector GS-201",
    type: "gas",
    installationArea: "South Tank Bund A · West Wall (T-101/T-103)",
    position: [-14.2, 1.8, 10.2],
    unit: "% LEL",
    baseValue: 2.4,
    warningThreshold: 20,
    criticalThreshold: 40,
  },
  {
    id: "SNS-GAS-02",
    code: "GS-204",
    name: "Hydrocarbon Gas Detector GS-204",
    type: "gas",
    installationArea: "Tank T-102 / South Manifold Junction",
    position: [-5.2, 2.2, 13.8],
    unit: "% LEL",
    baseValue: 3.1,
    warningThreshold: 20,
    criticalThreshold: 40,
  },
  {
    id: "SNS-GAS-03",
    code: "GS-207",
    name: "Open-Path Gas Detector GS-207",
    type: "gas",
    installationArea: "North Tank Bund B & Pipe Rack Intake",
    position: [-5.4, 2.2, -4.5],
    unit: "% LEL",
    baseValue: 2.0,
    warningThreshold: 20,
    criticalThreshold: 40,
  },
  {
    id: "SNS-GAS-04",
    code: "GS-211",
    name: "Catalytic Vapor Detector GS-211",
    type: "gas",
    installationArea: "Loading Gantry Canopy & VRU Vessels",
    position: [4.8, 2.8, 1.2],
    unit: "% LEL",
    baseValue: 4.5,
    warningThreshold: 20,
    criticalThreshold: 40,
  },

  // Temperature Sensors (Orange)
  {
    id: "SNS-TMP-01",
    code: "TS-102",
    name: "IR Thermal Array TS-102",
    type: "temperature",
    installationArea: "Tank T-102 Rim Seal & South Manifold",
    position: [-7.6, 3.9, 12.6],
    unit: "deg C",
    baseValue: 33.4,
    warningThreshold: 55,
    criticalThreshold: 80,
  },
  {
    id: "SNS-TMP-02",
    code: "TS-105",
    name: "Gantry Thermal Probe TS-105",
    type: "temperature",
    installationArea: "Loading Gantry Bay Canopy (LB-01)",
    position: [6.8, 3.6, 4.2],
    unit: "deg C",
    baseValue: 34.1,
    warningThreshold: 55,
    criticalThreshold: 80,
  },
  {
    id: "SNS-TMP-03",
    code: "TS-109",
    name: "Utility & Bund B Thermal Sensor TS-109",
    type: "temperature",
    installationArea: "North Bund East Wall / Cooling Complex",
    position: [10.6, 2.8, -5.0],
    unit: "deg C",
    baseValue: 32.8,
    warningThreshold: 55,
    criticalThreshold: 80,
  },

  // Smoke Detectors (Gray)
  {
    id: "SNS-SMK-01",
    code: "SM-301",
    name: "Optical Smoke Detector SM-301",
    type: "smoke",
    installationArea: "Central Cross-Road (Between Bund A & Gantry)",
    position: [-0.8, 2.5, 8.8],
    unit: "ppm",
    baseValue: 14,
    warningThreshold: 90,
    criticalThreshold: 200,
  },
  {
    id: "SNS-SMK-02",
    code: "SM-304",
    name: "Aspirating Smoke Sensor SM-304",
    type: "smoke",
    installationArea: "Control Room Intake & North Road",
    position: [-3.5, 3.0, -12.6],
    unit: "ppm",
    baseValue: 12,
    warningThreshold: 90,
    criticalThreshold: 200,
  },
  {
    id: "SNS-SMK-03",
    code: "SM-308",
    name: "Particulate Smoke Sensor SM-308",
    type: "smoke",
    installationArea: "Maintenance & South-East Exit Road",
    position: [11.2, 2.6, 11.4],
    unit: "ppm",
    baseValue: 16,
    warningThreshold: 90,
    criticalThreshold: 200,
  },

  // Flame Detectors (Red)
  {
    id: "SNS-FLM-01",
    code: "FL-401",
    name: "Triple-IR Flame Detector FL-401",
    type: "fire",
    installationArea: "South Tank Bund & Main Pump Station",
    position: [0.6, 2.9, 13.8],
    unit: "IR Idx",
    baseValue: 4,
    warningThreshold: 35,
    criticalThreshold: 65,
  },
  {
    id: "SNS-FLM-02",
    code: "FL-402",
    name: "UV/IR Flame Detector FL-402",
    type: "fire",
    installationArea: "North Tank Bund & Booster Manifold",
    position: [-2.0, 2.9, -11.4],
    unit: "IR Idx",
    baseValue: 3,
    warningThreshold: 35,
    criticalThreshold: 65,
  },
  {
    id: "SNS-FLM-03",
    code: "FL-405",
    name: "Optical Flame Sensor FL-405",
    type: "fire",
    installationArea: "Tanker Loading Canopy Bays",
    position: [8.8, 3.3, 6.2],
    unit: "IR Idx",
    baseValue: 5,
    warningThreshold: 35,
    criticalThreshold: 65,
  },

  // Wind Sensors (Cyan)
  {
    id: "SNS-WND-01",
    code: "WS-501",
    name: "Ultrasonic Anemometer WS-501",
    type: "wind",
    installationArea: "North-West Tower Mast (Control Hub)",
    position: [-15.8, 6.6, -11.5],
    unit: "m/s",
    baseValue: 2.8,
    warningThreshold: 6.0,
    criticalThreshold: 10.0,
    windDirectionDeg: 135,
    windLabel: "NW -> SE",
  },
  {
    id: "SNS-WND-02",
    code: "WS-502",
    name: "Ultrasonic Anemometer WS-502",
    type: "wind",
    installationArea: "East Utility Perimeter Mast",
    position: [15.5, 6.6, -12.0],
    unit: "m/s",
    baseValue: 2.9,
    warningThreshold: 6.0,
    criticalThreshold: 10.0,
    windDirectionDeg: 135,
    windLabel: "NW -> SE",
  },
];

export const DEPOT_NAV_NODES: DepotNavNode[] = [
  {
    id: "N-WRK-TANK",
    label: "Bund Inspection Crew (4)",
    kind: "worker-start",
    position: [-9.8, 0.2, 4.0],
    workerGroup: "Tank Farm Crew",
    workerCount: 4,
  },
  {
    id: "N-WRK-PUMP",
    label: "Pump Manifold Crew (3)",
    kind: "worker-start",
    position: [5.6, 0.2, 13.6],
    workerGroup: "Pumping Ops",
    workerCount: 3,
  },
  {
    id: "N-WRK-LOAD",
    label: "Loading Gantry Crew (6)",
    kind: "worker-start",
    position: [6.8, 0.2, 6.6],
    workerGroup: "Gantry Dispatch",
    workerCount: 6,
  },
  {
    id: "N-WRK-MAINT",
    label: "Maintenance Crew (4)",
    kind: "worker-start",
    position: [10.8, 0.2, 3.8],
    workerGroup: "Maintenance",
    workerCount: 4,
  },
  {
    id: "N-WRK-CTRL",
    label: "Control & Office Staff (5)",
    kind: "worker-start",
    position: [-4.0, 0.2, -17.2],
    workerGroup: "Control Room",
    workerCount: 5,
  },
  // Junctions along gray road grid
  { id: "J-SW", label: "South-West Junction", kind: "junction", position: [-15.8, 0.15, 16.5] },
  { id: "J-SC", label: "South-Center Junction", kind: "junction", position: [0.35, 0.15, 16.5] },
  { id: "J-SE", label: "South-East Junction", kind: "junction", position: [10.6, 0.15, 16.5] },
  { id: "J-CW", label: "West Perimeter Mid", kind: "junction", position: [-15.8, 0.15, 2.0] },
  { id: "J-CC", label: "Central Manifold Crossroad", kind: "junction", position: [0.35, 0.15, 2.0] },
  { id: "J-CE", label: "East Road Mid", kind: "junction", position: [10.6, 0.15, 2.0] },
  { id: "J-NW", label: "North-West Corner", kind: "junction", position: [-15.8, 0.15, -17.2] },
  { id: "J-NC", label: "North-Center Road", kind: "junction", position: [0.35, 0.15, -17.2] },
  { id: "J-NE", label: "North-East Staging Junction", kind: "junction", position: [10.6, 0.15, -17.2] },
];

export const TWIN_SCENARIOS: Record<TwinScenarioId, TwinScenarioConfig> = {
  normal: {
    id: "normal",
    name: "1. Normal Condition",
    shortLabel: "Normal",
    incidentLocation: "None · Routine Terminal Operations",
    severity: "Nominal",
    windSpeedMps: 2.8,
    windDirectionDeg: 135,
    windDirectionLabel: "NW -> SE (2.8 m/s)",
    summary:
      "All 15 storage tanks, pumping manifolds, loading gantries, and utility blocks operate within safe HSE thresholds. Routine access corridors are fully open.",
    environmentalNote:
      "Ambient light breeze (2.8 m/s). Zero vapor accumulation above background LEL levels.",
    hazards: [],
    sensorOverrides: {},
    assetOverrides: {},
    blockedEdgeIds: [],
    cautionEdgeIds: [],
    recommendedRoutePaths: [
      {
        id: "PATH-NORM-WEST",
        label: "West Service Corridor -> Exit W1 -> AP-ALPHA",
        originLabel: "Bund Inspection Crew",
        destinationLabel: "AP-ALPHA",
        waypoints: [
          [-9.8, 0.25, 4.0],
          [-9.8, 0.25, 2.0],
          [-15.8, 0.25, 2.0],
          [-15.8, 0.25, 14.5],
          [-20.5, 0.25, 14.5],
        ],
        riskScore: 8,
        distanceM: 125,
        status: "normal",
      },
      {
        id: "PATH-NORM-SOUTH",
        label: "Loading Gantry -> East Road -> Exit S2 -> AP-BRAVO",
        originLabel: "Loading & Pumping Crew",
        destinationLabel: "AP-BRAVO",
        waypoints: [
          [6.8, 0.25, 6.6],
          [10.6, 0.25, 6.6],
          [10.6, 0.25, 16.5],
          [16.8, 0.25, 16.5],
        ],
        riskScore: 10,
        distanceM: 135,
        status: "normal",
      },
      {
        id: "PATH-NORM-NORTH",
        label: "Control & Dispatch -> North Gate N3 -> AP-CHARLIE",
        originLabel: "Control & Office Staff",
        destinationLabel: "AP-CHARLIE",
        waypoints: [
          [-4.0, 0.25, -17.2],
          [13.2, 0.25, -17.2],
          [13.2, 0.25, -21.0],
          [17.8, 0.25, -21.0],
        ],
        riskScore: 7,
        distanceM: 148,
        status: "normal",
      },
    ],
  },

  "gas-leak": {
    id: "gas-leak",
    name: "2. Gas Leakage",
    shortLabel: "Gas Leakage",
    incidentLocation: "Tank T-102 South Manifold & Pump Header (PS-01)",
    severity: "High",
    windSpeedMps: 2.1,
    windDirectionDeg: 135,
    windDirectionLabel: "Light Breeze SE (2.1 m/s)",
    summary:
      "Simulated flange gasket leak at Tank T-102 header elevating localized vapor readings to 46.5% LEL. South-Center corridor is automatically locked out while West Upwind & East Perimeter routes guide personnel safely.",
    environmentalNote:
      "Low breeze causes hydrocarbon vapors to pool near South Bund A & Pump Station PS-01.",
    hazards: [
      {
        id: "HZ-GAS-STATIC",
        label: "Hydrocarbon Vapor Pocket (46.5% LEL)",
        type: "gas",
        severity: "Critical",
        center: [-3.4, 0, 14.2],
        radius: 5.8,
        height: 3.4,
        affectedSummary:
          "Envelops T-102, T-105, South Pump Station PS-01 west intake, and the South-Center access road.",
      },
    ],
    sensorOverrides: {
      "SNS-GAS-02": { value: 46.5, status: "Critical" },
      "SNS-GAS-01": { value: 23.8, status: "Warning" },
      "SNS-TMP-01": { value: 58.2, status: "Warning" },
    },
    assetOverrides: {
      "T-102": {
        status: "Critical",
        hazardNote: "Active vapor release at south manifold flange (46.5% LEL).",
      },
      "T-105": {
        status: "Warning",
        hazardNote: "Within 15m of vapor cloud boundary; transfer isolated.",
      },
      "PUMP-MAIN": {
        status: "Critical",
        hazardNote: "PS-01 adjacent intake in Ex-Zone gas cloud; remote ESD tripped.",
      },
    },
    blockedEdgeIds: ["E-SOUTH-CROSS"],
    cautionEdgeIds: ["E-WEST-MID"],
    recommendedRoutePaths: [
      {
        id: "PATH-GAS-BLOCKED",
        label: "Blocked: South Bund A Road -> Exit W1 (In Vapor Cloud)",
        originLabel: "South Apron / PS-01",
        destinationLabel: "AP-ALPHA (Blocked)",
        waypoints: [
          [5.6, 0.25, 13.6],
          [5.6, 0.25, 16.5],
          [-15.8, 0.25, 16.5],
          [-15.8, 0.25, 14.5],
          [-20.5, 0.25, 14.5],
        ],
        riskScore: 86,
        distanceM: 165,
        status: "blocked",
      },
      {
        id: "PATH-GAS-CAUTION",
        label: "Caution: Upwind West Corridor -> Exit W1 -> AP-ALPHA",
        originLabel: "Bund Inspection Crew",
        destinationLabel: "AP-ALPHA",
        waypoints: [
          [-9.8, 0.25, 4.0],
          [-9.8, 0.25, 2.0],
          [-15.8, 0.25, 2.0],
          [-15.8, 0.25, 14.5],
          [-20.5, 0.25, 14.5],
        ],
        riskScore: 44,
        distanceM: 125,
        status: "caution",
      },
      {
        id: "PATH-GAS-REC-1",
        label: "Recommended: Pump Apron East Bypass -> Exit S2 -> AP-BRAVO",
        originLabel: "Pump Manifold Crew",
        destinationLabel: "AP-BRAVO",
        waypoints: [
          [5.6, 0.25, 13.6],
          [10.6, 0.25, 13.6],
          [10.6, 0.25, 16.5],
          [16.8, 0.25, 16.5],
        ],
        riskScore: 16,
        distanceM: 112,
        status: "recommended",
      },
      {
        id: "PATH-GAS-REC-LOAD",
        label: "Recommended: Loading Gantry -> East Road -> Exit S2 -> AP-BRAVO",
        originLabel: "Loading Gantry Crew",
        destinationLabel: "AP-BRAVO",
        waypoints: [
          [6.8, 0.25, 6.6],
          [10.6, 0.25, 6.6],
          [10.6, 0.25, 16.5],
          [16.8, 0.25, 16.5],
        ],
        riskScore: 14,
        distanceM: 135,
        status: "recommended",
      },
      {
        id: "PATH-GAS-REC-2",
        label: "Recommended: North Perimeter -> Exit N3 -> AP-CHARLIE",
        originLabel: "Control & Office Staff",
        destinationLabel: "AP-CHARLIE",
        waypoints: [
          [-4.0, 0.25, -17.2],
          [13.2, 0.25, -17.2],
          [13.2, 0.25, -21.0],
          [17.8, 0.25, -21.0],
        ],
        riskScore: 11,
        distanceM: 148,
        status: "recommended",
      },
    ],
  },

  fire: {
    id: "fire",
    name: "3. Fire Incident",
    shortLabel: "Fire Incident",
    incidentLocation: "Tank T-102 Rim Seal & South Tank Bund A",
    severity: "Critical",
    windSpeedMps: 3.4,
    windDirectionDeg: 135,
    windDirectionLabel: "SE Drift (3.4 m/s)",
    summary:
      "Simulated rim-seal ignition at Storage Tank T-102 radiating intense heat across South Bund A and the central cross-road. West Gate EX-W1 is isolated due to thermal radiation; crews evacuate East and North.",
    environmentalNote:
      "Elevated radiant thermal flux (>85 deg C) triggers deluge water curtain around adjacent tanks.",
    hazards: [
      {
        id: "HZ-FIRE-CORE",
        label: "Pool / Rim-Seal Fire & Radiant Heat Zone",
        type: "fire",
        severity: "Critical",
        center: [-7.6, 0, 11.8],
        radius: 6.4,
        height: 5.2,
        affectedSummary:
          "Impacts T-101, T-102, T-103, T-104, and South-West Exit Road.",
      },
    ],
    sensorOverrides: {
      "SNS-FLM-01": { value: 86, status: "Critical" },
      "SNS-TMP-01": { value: 118.4, status: "Critical" },
      "SNS-GAS-02": { value: 52.0, status: "Critical" },
      "SNS-SMK-01": { value: 164, status: "Warning" },
      "SNS-FLM-02": { value: 42, status: "Warning" },
    },
    assetOverrides: {
      "T-102": {
        status: "Critical",
        hazardNote: "Active rim-seal fire! Foam & deluge ring cooling engaged (simulated).",
      },
      "T-101": {
        status: "Critical",
        hazardNote: "High radiant heat exposure from T-102; adjacent boundary closed.",
      },
      "T-104": {
        status: "Warning",
        hazardNote: "Water curtain active on east shell wall.",
      },
      "EXIT-W1": {
        status: "Critical",
        hazardNote: "Exit W1 compromised by radiant heat flux from South Bund A.",
      },
    },
    blockedEdgeIds: ["E-WEST-EXIT"],
    cautionEdgeIds: ["E-CENTER-CROSS"],
    recommendedRoutePaths: [
      {
        id: "PATH-FIRE-BLOCKED",
        label: "Blocked: West Corridor to Exit W1 (Radiant Heat)",
        originLabel: "Bund Inspection Crew",
        destinationLabel: "AP-ALPHA (Blocked)",
        waypoints: [
          [-9.8, 0.25, 4.0],
          [-9.8, 0.25, 2.0],
          [-15.8, 0.25, 2.0],
          [-15.8, 0.25, 14.5],
          [-20.5, 0.25, 14.5],
        ],
        riskScore: 92,
        distanceM: 125,
        status: "blocked",
      },
      {
        id: "PATH-FIRE-CAUTION",
        label: "Caution: South Road Perimeter -> Exit S2 -> AP-BRAVO (Radiant Margin)",
        originLabel: "Pump Manifold Crew",
        destinationLabel: "AP-BRAVO",
        waypoints: [
          [5.6, 0.25, 13.6],
          [5.6, 0.25, 16.5],
          [16.8, 0.25, 16.5],
        ],
        riskScore: 48,
        distanceM: 110,
        status: "caution",
      },
      {
        id: "PATH-FIRE-REC-NORTH",
        label: "Recommended: Central Manifold & North Shielded Corridor -> AP-CHARLIE",
        originLabel: "Bund Inspection Crew",
        destinationLabel: "AP-CHARLIE",
        waypoints: [
          [-9.8, 0.25, 4.0],
          [-9.8, 0.25, 2.0],
          [0.35, 0.25, 2.0],
          [0.35, 0.25, -17.2],
          [13.2, 0.25, -17.2],
          [13.2, 0.25, -21.0],
          [17.8, 0.25, -21.0],
        ],
        riskScore: 21,
        distanceM: 225,
        status: "recommended",
      },
      {
        id: "PATH-FIRE-REC-EAST",
        label: "Recommended: East Gantry Corridor -> Exit S2 -> AP-BRAVO",
        originLabel: "Loading Gantry Crew",
        destinationLabel: "AP-BRAVO",
        waypoints: [
          [6.8, 0.25, 6.6],
          [10.6, 0.25, 6.6],
          [10.6, 0.25, 16.5],
          [16.8, 0.25, 16.5],
        ],
        riskScore: 19,
        distanceM: 135,
        status: "recommended",
      },
    ],
  },

  smoke: {
    id: "smoke",
    name: "4. Smoke Dispersion",
    shortLabel: "Smoke Dispersion",
    incidentLocation: "Central Pipe Corridor & Loading Gantry Approach",
    severity: "Elevated",
    windSpeedMps: 3.8,
    windDirectionDeg: 135,
    windDirectionLabel: "East-South-East (3.8 m/s)",
    summary:
      "Simulated particulate smoke plume drifting eastward across the Loading Gantry canopy and Maintenance approach, degrading visibility along the East Road while West & North avenues stay clear.",
    environmentalNote:
      "Visibility obscuration (>200 ppm) along East-Central lanes requires rerouting away from Exit S2.",
    hazards: [
      {
        id: "HZ-SMOKE-PLUME",
        label: "Dense Particulate Smoke Corridor (245 ppm)",
        type: "smoke",
        severity: "High",
        center: [6.8, 0, 5.2],
        radius: 6.2,
        height: 4.2,
        windStretch: { dx: 0.7, dz: 0.4, lengthMultiplier: 1.45 },
        affectedSummary:
          "Obscures Loading Gantry LB-01, Metering Island LB-02, and Maintenance access.",
      },
    ],
    sensorOverrides: {
      "SNS-SMK-01": { value: 215, status: "Critical" },
      "SNS-SMK-03": { value: 248, status: "Critical" },
      "SNS-TMP-02": { value: 62.5, status: "Warning" },
      "SNS-FLM-03": { value: 38, status: "Warning" },
    },
    assetOverrides: {
      "LOAD-GANTRY": {
        status: "Critical",
        hazardNote: "Dense smoke (>240 ppm) inside loading bays; gantry operations halted.",
      },
      "LOAD-METERING": {
        status: "Warning",
        hazardNote: "Low visibility along loading apron.",
      },
      "BLD-MAINT": {
        status: "Warning",
        hazardNote: "HVAC intake dampers switched to recirculation.",
      },
    },
    blockedEdgeIds: ["E-EAST-GANTRY"],
    cautionEdgeIds: ["E-SOUTH-GATE"],
    recommendedRoutePaths: [
      {
        id: "PATH-SMK-BLOCKED",
        label: "Blocked: East Gantry Road -> Exit S2 -> AP-BRAVO (Visibility < 3m)",
        originLabel: "Maintenance Crew",
        destinationLabel: "AP-BRAVO (Blocked)",
        waypoints: [
          [10.8, 0.25, 3.8],
          [10.6, 0.25, 3.8],
          [10.6, 0.25, 16.5],
          [16.8, 0.25, 16.5],
        ],
        riskScore: 78,
        distanceM: 145,
        status: "blocked",
      },
      {
        id: "PATH-SMK-CAUTION",
        label: "Caution: South Perimeter East -> Exit S2 -> AP-BRAVO (ESE Drift Margin)",
        originLabel: "Pump Manifold Crew",
        destinationLabel: "AP-BRAVO",
        waypoints: [
          [5.6, 0.25, 13.6],
          [5.6, 0.25, 16.5],
          [16.8, 0.25, 16.5],
        ],
        riskScore: 42,
        distanceM: 110,
        status: "caution",
      },
      {
        id: "PATH-SMK-REC-WEST",
        label: "Recommended: South Road Upwind West -> Exit W1 -> AP-ALPHA",
        originLabel: "Pump Apron Bypass",
        destinationLabel: "AP-ALPHA",
        waypoints: [
          [5.6, 0.25, 13.6],
          [5.6, 0.25, 16.5],
          [-15.8, 0.25, 16.5],
          [-15.8, 0.25, 14.5],
          [-20.5, 0.25, 14.5],
        ],
        riskScore: 19,
        distanceM: 165,
        status: "recommended",
      },
      {
        id: "PATH-SMK-REC-BUND",
        label: "Recommended: Upwind West Tank Corridor -> Exit W1 -> AP-ALPHA",
        originLabel: "Bund Inspection Crew",
        destinationLabel: "AP-ALPHA",
        waypoints: [
          [-9.8, 0.25, 4.0],
          [-9.8, 0.25, 2.0],
          [-15.8, 0.25, 2.0],
          [-15.8, 0.25, 14.5],
          [-20.5, 0.25, 14.5],
        ],
        riskScore: 14,
        distanceM: 125,
        status: "recommended",
      },
      {
        id: "PATH-SMK-REC-NORTH",
        label: "Recommended: North Perimeter Bypass -> Exit N3 -> AP-CHARLIE",
        originLabel: "Control & Office Staff",
        destinationLabel: "AP-CHARLIE",
        waypoints: [
          [-4.0, 0.25, -17.2],
          [13.2, 0.25, -17.2],
          [13.2, 0.25, -21.0],
          [17.8, 0.25, -21.0],
        ],
        riskScore: 12,
        distanceM: 148,
        status: "recommended",
      },
    ],
  },

  "gas-wind": {
    id: "gas-wind",
    name: "5. Gas Leakage with Wind Dispersion",
    shortLabel: "Gas + Wind Drift",
    incidentLocation: "North Bund B (T-109) + Strong NW Wind (5.8 m/s)",
    severity: "Critical",
    windSpeedMps: 5.8,
    windDirectionDeg: 135,
    windDirectionLabel: "Strong NW -> SE Gusts (5.8 m/s)",
    summary:
      "Demonstrates how wind speed & direction reshape hazard boundaries: a pressurized gas leak near T-109 is carried South-East across the Loading Gantry and South-East road. EVORA blocks downwind exits and routes all crews upwind West & North.",
    environmentalNote:
      "5.8 m/s NW->SE gust elongates flammable cloud (38-64% LEL) into the South-East quadrant.",
    hazards: [
      {
        id: "HZ-GAS-WIND",
        label: "Wind-Elongated Vapor Plume (64.2% LEL Core)",
        type: "gas",
        severity: "Critical",
        center: [2.2, 0, 1.5],
        radius: 5.4,
        height: 3.6,
        windStretch: { dx: 0.72, dz: 0.68, lengthMultiplier: 2.15 },
        affectedSummary:
          "Sweeps across Central Pipe Rack, Loading Gantry LB-01, and South-East Exit S2.",
      },
    ],
    sensorOverrides: {
      "SNS-WND-01": { value: 5.8, status: "Warning" },
      "SNS-WND-02": { value: 6.1, status: "Warning" },
      "SNS-GAS-03": { value: 54.0, status: "Critical" },
      "SNS-GAS-04": { value: 64.2, status: "Critical" },
      "SNS-GAS-02": { value: 29.4, status: "Warning" },
      "SNS-SMK-03": { value: 112, status: "Warning" },
    },
    assetOverrides: {
      "T-109": {
        status: "Critical",
        hazardNote: "Source flange leak feeding downwind vapor plume.",
      },
      "LOAD-GANTRY": {
        status: "Critical",
        hazardNote: "In direct SE wind drift corridor (64.2% LEL); emergency shutdown!",
      },
      "LOAD-METERING": {
        status: "Critical",
        hazardNote: "Envelope inside downwind flammable gas plume.",
      },
      "EXIT-S2": {
        status: "Critical",
        hazardNote: "Gate S2 closed for egress due to downwind hydrocarbon drift.",
      },
      "AP-BRAVO": {
        status: "Warning",
        hazardNote: "Downwind muster on caution; divert crews to upwind Alpha/Charlie.",
      },
    },
    blockedEdgeIds: ["E-EAST-GANTRY", "E-SOUTH-EAST"],
    cautionEdgeIds: ["E-SOUTH-CROSS"],
    recommendedRoutePaths: [
      {
        id: "PATH-WIND-BLOCKED",
        label: "Blocked: Downwind East & Exit S2 Corridor (Plume Drift)",
        originLabel: "Loading Gantry LB-01",
        destinationLabel: "AP-BRAVO (Blocked)",
        waypoints: [
          [6.8, 0.25, 6.6],
          [10.6, 0.25, 6.6],
          [10.6, 0.25, 16.5],
          [16.8, 0.25, 16.5],
        ],
        riskScore: 91,
        distanceM: 135,
        status: "blocked",
      },
      {
        id: "PATH-WIND-CAUTION",
        label: "Caution: South Tank Road Crosswind -> Exit W1 -> AP-ALPHA",
        originLabel: "Pump Manifold Crew",
        destinationLabel: "AP-ALPHA",
        waypoints: [
          [5.6, 0.25, 13.6],
          [5.6, 0.25, 16.5],
          [-15.8, 0.25, 16.5],
          [-15.8, 0.25, 14.5],
          [-20.5, 0.25, 14.5],
        ],
        riskScore: 46,
        distanceM: 165,
        status: "caution",
      },
      {
        id: "PATH-WIND-REC-ALPHA",
        label: "Recommended: Upwind Cross-Depot Corridor -> Exit W1 -> AP-ALPHA",
        originLabel: "Bund Inspection Crew",
        destinationLabel: "AP-ALPHA",
        waypoints: [
          [-9.8, 0.25, 4.0],
          [-9.8, 0.25, 2.0],
          [-15.8, 0.25, 2.0],
          [-15.8, 0.25, 14.5],
          [-20.5, 0.25, 14.5],
        ],
        riskScore: 14,
        distanceM: 125,
        status: "recommended",
      },
      {
        id: "PATH-WIND-REC-CHARLIE",
        label: "Recommended: Upwind North Road -> Exit N3 -> AP-CHARLIE",
        originLabel: "Control & North Office",
        destinationLabel: "AP-CHARLIE",
        waypoints: [
          [-4.0, 0.25, -17.2],
          [13.2, 0.25, -17.2],
          [13.2, 0.25, -21.0],
          [17.8, 0.25, -21.0],
        ],
        riskScore: 12,
        distanceM: 148,
        status: "recommended",
      },
    ],
  },
};

export function getSensorReading(
  sensor: TwinSensorNode,
  scenario: TwinScenarioConfig
): { value: number; status: TwinStatus } {
  const override = scenario.sensorOverrides[sensor.id];
  if (override) return override;
  return { value: sensor.baseValue, status: "Normal" };
}

export function getAssetStatus(
  asset: TwinFacilityObject,
  scenario: TwinScenarioConfig
): { status: TwinStatus; hazardNote: string } {
  const override = scenario.assetOverrides[asset.id];
  if (override) return override;
  return { status: "Normal", hazardNote: asset.baseHazardNote };
}
