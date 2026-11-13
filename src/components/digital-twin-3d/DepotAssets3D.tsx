"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { Edges, Html, Line } from "@react-three/drei";
import {
  ALL_TWIN_ENTITIES,
  TwinFacilityObject,
  TwinScenarioConfig,
  TwinStatus,
  getAssetStatus,
} from "./depot-twin-data";

interface DepotAssets3DProps {
  scenario: TwinScenarioConfig;
  selectedObjectId: string | null;
  hoveredObjectId: string | null;
  onSelectObject: (id: string) => void;
  onHoverObject: (id: string | null) => void;
  showLabels?: boolean;
}

const STATUS_RING_COLOR: Record<TwinStatus, string> = {
  Normal: "#94A3B8",
  Warning: "#F59E0B",
  Critical: "#EF4444",
};

const CATEGORY_ACCENT_COLOR: Record<TwinFacilityObject["category"], string> = {
  "Storage Tank": "#F8FAFC",
  "Loading & Unloading": "#E0F2FE",
  "Pumping Station": "#E2E8F0",
  "Operational Building": "#F1F5F9",
  "Utility Facility": "#E0E7FF",
  "Emergency Exit": "#10B981",
  "Assembly Point": "#22C55E",
};

function setCursorPointer(active: boolean) {
  if (typeof document !== "undefined") {
    document.body.style.cursor = active ? "pointer" : "auto";
  }
}

/**
 * Reusable Fuel Tanker Truck mesh positioned in loading bays and staging lot.
 */
function FuelTankerTruck3D({
  position,
  rotationY = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Chassis */}
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.16, 0.72]} />
        <meshStandardMaterial color="#475569" roughness={0.65} />
      </mesh>
      {/* Cab */}
      <mesh position={[0.92, 0.56, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.58, 0.72]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.35} />
        <Edges threshold={15} color="#475569" />
      </mesh>
      {/* Windshield */}
      <mesh position={[1.24, 0.62, 0]}>
        <boxGeometry args={[0.02, 0.26, 0.58]} />
        <meshStandardMaterial color="#38BDF8" roughness={0.2} />
      </mesh>
      {/* Cylindrical Tanker Trailer */}
      <mesh
        position={[-0.3, 0.62, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.34, 0.34, 1.55, 20]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} metalness={0.18} />
        <Edges threshold={20} color="#64748B" />
      </mesh>
      {/* Red Pertamina-style accent band on trailer */}
      <mesh
        position={[-0.3, 0.62, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.345, 0.345, 0.22, 20]} />
        <meshStandardMaterial color="#EF4444" roughness={0.4} />
      </mesh>
      {/* Wheels */}
      {[
        [-0.85, 0.16, 0.36],
        [-0.85, 0.16, -0.36],
        [-0.35, 0.16, 0.36],
        [-0.35, 0.16, -0.36],
        [0.88, 0.16, 0.36],
        [0.88, 0.16, -0.36],
      ].map((pos, idx) => (
        <mesh
          key={idx}
          position={pos as [number, number, number]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.16, 0.16, 0.1, 12]} />
          <meshStandardMaterial color="#1E293B" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Slender lattice tower mast (6 perimeter monitoring & lightning masts matching reference)
 */
function LatticeMast3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Concrete plinth */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.3, 0.7]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
        <Edges threshold={15} color="#475569" />
      </mesh>
      {/* Tapered wireframe steel lattice */}
      <mesh position={[0, 3.6, 0]}>
        <cylinderGeometry args={[0.18, 0.52, 6.6, 4, 5]} />
        <meshStandardMaterial
          color="#475569"
          wireframe
          roughness={0.5}
          metalness={0.4}
        />
      </mesh>
      {/* Top lightning & comms finial */}
      <mesh position={[0, 7.1, 0]}>
        <cylinderGeometry args={[0.03, 0.08, 0.9, 6]} />
        <meshStandardMaterial color="#64748B" />
      </mesh>
      <mesh position={[0, 6.75, 0]}>
        <boxGeometry args={[0.42, 0.14, 0.42]} />
        <meshStandardMaterial color="#E2E8F0" />
        <Edges threshold={15} color="#475569" />
      </mesh>
    </group>
  );
}

/**
 * Static environment infrastructure: ground plane, grid, road network, orange containment bunds,
 * cyan operational pads, pipeline corridors, elevated truss bridge, rail transfer rack,
 * 2x4 additive skids, and staging tanker trucks.
 */
function DepotEnvironmentAndInfrastructure() {
  const redBoundaryPoints = useMemo<[number, number, number][]>(
    () => [
      [-18.0, 0.04, -19.2],
      [17.6, 0.04, -19.2],
      [17.6, 0.04, 18.2],
      [4.5, 0.04, 18.2],
      [4.5, 0.04, 19.3],
      [-1.5, 0.04, 19.3],
      [-1.5, 0.04, 18.2],
      [-18.0, 0.04, 18.2],
      [-18.0, 0.04, -19.2],
    ],
    []
  );

  // Pipe run segments linking Tank Bunds -> Pumping Station -> Booster -> Loading Gantry
  const pipelineRuns = useMemo<
    { pos: [number, number, number]; len: number; rotY?: number }[]
  >(
    () => [
      // South Bund A header along x = -0.7
      { pos: [-0.8, 0.45, 10.4], len: 10.6, rotY: 0 },
      // North Bund B header along x = -0.7
      { pos: [-0.8, 0.45, -4.6], len: 10.4, rotY: 0 },
      // Link South Header -> South Main Pump Station
      { pos: [0.1, 0.45, 13.8], len: 2.0, rotY: Math.PI / 2 },
      // Main North-South pipe bridge spanning from Pump Main to Booster
      { pos: [-0.8, 0.55, -10.5], len: 7.4, rotY: 0 },
      // East branch feeding Loading Gantry & VRU
      { pos: [2.2, 0.48, 3.8], len: 6.2, rotY: Math.PI / 2 },
      { pos: [2.4, 0.48, -10.2], len: 5.8, rotY: Math.PI / 2 },
    ],
    []
  );

  return (
    <group>
      {/* Crisp Architectural White/Off-white Base Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.95} />
      </mesh>

      {/* Subtle CAD Reference Grid */}
      <gridHelper args={[64, 32, "#CBD5E1", "#E2E8F0"]} position={[0, 0.005, 0]} />

      {/* Outer Red Industrial Safety Boundary Perimeter */}
      <Line
        points={redBoundaryPoints}
        color="#DC2626"
        lineWidth={1.8}
      />

      {/* Gray Internal & Perimeter Access Roads */}
      {/* West Perimeter Road */}
      <mesh position={[-15.8, 0.015, -0.5]} receiveShadow>
        <boxGeometry args={[2.1, 0.03, 35.4]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.85} />
      </mesh>
      {/* Central Manifold Avenue (Separates Storage Bunds from Loading Zone) */}
      <mesh position={[0.4, 0.015, -0.5]} receiveShadow>
        <boxGeometry args={[2.0, 0.03, 35.4]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.85} />
      </mesh>
      {/* East Perimeter Road */}
      <mesh position={[10.4, 0.015, -0.5]} receiveShadow>
        <boxGeometry args={[2.0, 0.03, 35.4]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.85} />
      </mesh>
      {/* South Road */}
      <mesh position={[-2.4, 0.016, 16.5]} receiveShadow>
        <boxGeometry args={[30.0, 0.03, 2.0]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.85} />
      </mesh>
      {/* Mid Cross Road between South/North Bunds & Gantry */}
      <mesh position={[-2.6, 0.016, 2.0]} receiveShadow>
        <boxGeometry args={[28.4, 0.03, 1.8]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.85} />
      </mesh>
      {/* North Internal Road */}
      <mesh position={[-2.4, 0.016, -17.2]} receiveShadow>
        <boxGeometry args={[30.0, 0.03, 2.0]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.85} />
      </mesh>
      {/* Outer East Maintenance Bypass Lane */}
      <mesh position={[15.8, 0.014, -2.0]} receiveShadow>
        <boxGeometry args={[1.6, 0.03, 33.0]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.88} />
      </mesh>
      {/* North Dispatch Apron & Staging Pad */}
      <mesh position={[14.5, 0.016, -21.5]} receiveShadow>
        <boxGeometry args={[11.2, 0.03, 7.0]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.86} />
      </mesh>

      {/* Road Center-line Markings */}
      {[
        [
          [-15.8, 0.035, -16.5],
          [-15.8, 0.035, 16.5],
        ],
        [
          [10.4, 0.035, -16.5],
          [10.4, 0.035, 16.5],
        ],
        [
          [-15.8, 0.035, 16.5],
          [12.0, 0.035, 16.5],
        ],
        [
          [-15.8, 0.035, -17.2],
          [12.0, 0.035, -17.2],
        ],
      ].map((seg, i) => (
        <Line
          key={i}
          points={seg as [number, number, number][]}
          color="#FFFFFF"
          lineWidth={1.2}
          dashed
          dashSize={0.7}
          gapSize={0.5}
        />
      ))}

      {/* SOUTH TANK CONTAINMENT BUND A (Orange Bund + Dike Walls) */}
      <group position={[-7.8, 0, 10.1]}>
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <boxGeometry args={[13.2, 0.05, 9.6]} />
          <meshStandardMaterial color="#FED7AA" roughness={0.85} />
        </mesh>
        {/* Dike walls */}
        {[
          [0, 0.35, 4.85, 13.4, 0.7, 0.2],
          [0, 0.35, -4.85, 13.4, 0.7, 0.2],
          [-6.65, 0.35, 0, 0.2, 0.7, 9.8],
          [6.65, 0.35, 0, 0.2, 0.7, 9.8],
        ].map(([x, y, z, w, h, d], idx) => (
          <mesh key={idx} position={[x, y, z]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.65} />
            <Edges threshold={15} color="#64748B" />
          </mesh>
        ))}
      </group>

      {/* NORTH TANK CONTAINMENT BUND B (Orange Bund + Dike Walls) */}
      <group position={[-7.8, 0, -4.6]}>
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <boxGeometry args={[13.2, 0.05, 9.6]} />
          <meshStandardMaterial color="#FED7AA" roughness={0.85} />
        </mesh>
        {[
          [0, 0.35, 4.85, 13.4, 0.7, 0.2],
          [0, 0.35, -4.85, 13.4, 0.7, 0.2],
          [-6.65, 0.35, 0, 0.2, 0.7, 9.8],
          [6.65, 0.35, 0, 0.2, 0.7, 9.8],
        ].map(([x, y, z, w, h, d], idx) => (
          <mesh key={idx} position={[x, y, z]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.65} />
            <Edges threshold={15} color="#64748B" />
          </mesh>
        ))}
      </group>

      {/* PALE CYAN / BLUE OPERATIONAL PADS (Matching reference diagram) */}
      {/* Loading & Metering Zone Pad */}
      <mesh position={[5.6, 0.025, 7.2]} receiveShadow>
        <boxGeometry args={[8.0, 0.04, 12.2]} />
        <meshStandardMaterial color="#BAE6FD" roughness={0.8} />
        <Edges threshold={15} color="#38BDF8" />
      </mesh>
      {/* VRU & Metering Skids Blue Pad */}
      <mesh position={[5.2, 0.025, -6.2]} receiveShadow>
        <boxGeometry args={[7.8, 0.04, 10.6]} />
        <meshStandardMaterial color="#BAE6FD" roughness={0.8} />
        <Edges threshold={15} color="#38BDF8" />
      </mesh>
      {/* Small Orange Trench Pad near Control/Booster Manifold */}
      <mesh position={[2.8, 0.028, -13.8]} receiveShadow>
        <boxGeometry args={[3.8, 0.04, 3.2]} />
        <meshStandardMaterial color="#FED7AA" roughness={0.85} />
        <Edges threshold={15} color="#F97316" />
      </mesh>
      {/* East Utility & Electrical Yard Blue Pad */}
      <mesh position={[13.4, 0.025, -4.8]} receiveShadow>
        <boxGeometry args={[5.2, 0.04, 8.8]} />
        <meshStandardMaterial color="#BAE6FD" roughness={0.8} />
        <Edges threshold={15} color="#38BDF8" />
      </mesh>

      {/* 2x4 Crisp White Additive / Metering Skid Modules on Cyan Pad */}
      {[0, 1].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <mesh
            key={`skid-${row}-${col}`}
            position={[3.4 + col * 1.25, 0.35, -4.8 + row * 1.4]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.85, 0.65, 0.85]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.35} />
            <Edges threshold={15} color="#475569" />
          </mesh>
        ))
      )}

      {/* Interconnecting Industrial Fuel Transfer Pipelines */}
      {pipelineRuns.map((pipe, idx) => (
        <group
          key={idx}
          position={pipe.pos}
          rotation={[0, pipe.rotY ?? 0, 0]}
        >
          <mesh position={[-0.14, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, pipe.len, 10]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.35} roughness={0.4} />
          </mesh>
          <mesh position={[0.14, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, pipe.len, 10]} />
            <meshStandardMaterial color="#64748B" metalness={0.35} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Upper-Left Pipe Rack & Rail Tanker Transfer Spur */}
      <group position={[-17.1, 0, -3.0]}>
        {/* Rail track bed */}
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <boxGeometry args={[1.4, 0.05, 29.0]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.85} />
        </mesh>
        {/* Twin steel rails */}
        <Line
          points={[
            [-0.3, 0.07, -14.5],
            [-0.3, 0.07, 14.5],
          ]}
          color="#334155"
          lineWidth={1.6}
        />
        <Line
          points={[
            [0.3, 0.07, -14.5],
            [0.3, 0.07, 14.5],
          ]}
          color="#334155"
          lineWidth={1.6}
        />
        {/* Rail tank wagons docked at transfer rack */}
        {[-6.5, -2.5, 1.5, 5.5].map((rz, i) => (
          <group key={i} position={[0, 0.55, rz]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 3.1, 14]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.35} />
              <Edges threshold={20} color="#475569" />
            </mesh>
            <mesh position={[0, -0.35, 0]}>
              <boxGeometry args={[0.92, 0.16, 3.25]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          </group>
        ))}
        {/* Overhead steel truss gantry frames spanning north spur */}
        {[-12, -6, 0, 6, 12].map((fz, i) => (
          <group key={i} position={[0, 0, fz]}>
            <mesh position={[-0.75, 1.15, 0]}>
              <boxGeometry args={[0.1, 2.3, 0.1]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0.75, 1.15, 0]}>
              <boxGeometry args={[0.1, 2.3, 0.1]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 2.25, 0]}>
              <boxGeometry args={[1.65, 0.1, 0.14]} />
              <meshStandardMaterial color="#3B82F6" />
              <Edges threshold={15} color="#1E40AF" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Overhead Diagonal Electrical & Pipe Truss Bridge along NW Perimeter */}
      <group position={[-8.5, 3.8, -19.8]} rotation={[0, -0.05, 0]}>
        <mesh>
          <boxGeometry args={[28, 0.42, 0.55]} />
          <meshStandardMaterial color="#1D4ED8" wireframe />
        </mesh>
      </group>

      {/* 6 Perimeter Lightning / Surveillance Lattice Towers */}
      <LatticeMast3D position={[-18.3, 0, 10.5]} />
      <LatticeMast3D position={[-18.3, 0, -11.5]} />
      <LatticeMast3D position={[-0.2, 0, 18.2]} />
      <LatticeMast3D position={[8.6, 0, -10.5]} />
      <LatticeMast3D position={[16.8, 0, -12.0]} />
      <LatticeMast3D position={[16.8, 0, 13.5]} />

      {/* 4 Angled Tanker Trucks Parked in North-East Staging Lot (Matches Reference Upper-Right) */}
      {[0, 1, 2, 3].map((idx) => (
        <FuelTankerTruck3D
          key={`staging-truck-${idx}`}
          position={[11.2 + idx * 1.9, 0, -21.8 - idx * 0.45]}
          rotationY={Math.PI * 0.72}
          scale={0.9}
        />
      ))}
    </group>
  );
}

/**
 * Individual Clickable & Hoverable Cylindrical Fuel Storage Tank (Vertical or Horizontal)
 */
function SelectableTank3D({
  tank,
  scenario,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  showLabel,
}: {
  tank: TwinFacilityObject;
  scenario: TwinScenarioConfig;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
  showLabel: boolean;
}) {
  const { status } = getAssetStatus(tank, scenario);
  const [radius, height] = tank.dimensions;

  const shellColor =
    status === "Critical"
      ? "#FECACA"
      : status === "Warning"
        ? "#FDE68A"
        : "#F8FAFC";
  const edgeColor = isSelected
    ? "#2563EB"
    : isHovered
      ? "#0284C7"
      : status === "Critical"
        ? "#DC2626"
        : status === "Warning"
          ? "#D97706"
          : "#475569";

  const isHorizontal = tank.shape === "horizontal-cylinder";

  return (
    <group
      position={tank.position}
      rotation={[0, tank.rotationY ?? 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setCursorPointer(true);
        onHover(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setCursorPointer(false);
        onHover(false);
      }}
    >
      {isHorizontal ? (
        <group>
          {/* Concrete saddle supports */}
          <mesh position={[-0.75, 0.35, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.25, 0.7, 1.3]} />
            <meshStandardMaterial color="#CBD5E1" />
            <Edges threshold={15} color="#64748B" />
          </mesh>
          <mesh position={[0.75, 0.35, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.25, 0.7, 1.3]} />
            <meshStandardMaterial color="#CBD5E1" />
            <Edges threshold={15} color="#64748B" />
          </mesh>
          {/* Horizontal drum */}
          <mesh
            position={[0, 1.05, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[radius, radius, height, 24]} />
            <meshStandardMaterial color={shellColor} roughness={0.35} metalness={0.18} />
            <Edges threshold={18} color={edgeColor} />
          </mesh>
          {/* Dome ends */}
          <mesh position={[-height / 2, 1.05, 0]} castShadow>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshStandardMaterial color={shellColor} roughness={0.35} metalness={0.18} />
          </mesh>
          <mesh position={[height / 2, 1.05, 0]} castShadow>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshStandardMaterial color={shellColor} roughness={0.35} metalness={0.18} />
          </mesh>
        </group>
      ) : (
        <group>
          {/* Concrete plinth ring */}
          <mesh position={[0, 0.08, 0]} receiveShadow>
            <cylinderGeometry args={[radius + 0.14, radius + 0.18, 0.16, 28]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.8} />
          </mesh>

          {/* Main Metallic Cylinder Shell */}
          <mesh position={[0, height / 2 + 0.12, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[radius, radius, height, 32]} />
            <meshStandardMaterial
              color={shellColor}
              roughness={0.32}
              metalness={0.22}
            />
            <Edges threshold={20} color={edgeColor} />
          </mesh>

          {/* Conical / Floating Roof Rim Cap */}
          <mesh position={[0, height + 0.18, 0]} castShadow>
            <cylinderGeometry args={[radius * 0.94, radius * 1.01, 0.16, 32]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.4} metalness={0.25} />
            <Edges threshold={18} color={edgeColor} />
          </mesh>

          {/* Roof Center Gauge Hatch & Vent Stack */}
          <mesh position={[0, height + 0.34, 0]}>
            <cylinderGeometry args={[0.25, 0.28, 0.18, 12]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.3} />
            <Edges threshold={15} color="#475569" />
          </mesh>
          <mesh position={[radius * 0.45, height + 0.32, 0]}>
            <boxGeometry args={[0.35, 0.16, 0.35]} />
            <meshStandardMaterial color="#CBD5E1" />
          </mesh>

          {/* External Spiral Access Ladder Detail */}
          <mesh position={[radius + 0.06, height / 2 + 0.12, 0]}>
            <boxGeometry args={[0.08, height * 0.92, 0.32]} />
            <meshStandardMaterial color="#64748B" />
          </mesh>
        </group>
      )}

      {/* Selection or Incident Status Ring around base */}
      {(isSelected || isHovered || status !== "Normal") && (
        <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry
            args={[
              isHorizontal ? 1.5 : radius + 0.24,
              isHorizontal ? 1.72 : radius + 0.46,
              32,
            ]}
          />
          <meshBasicMaterial
            color={
              isSelected
                ? "#2563EB"
                : isHovered
                  ? "#0EA5E9"
                  : STATUS_RING_COLOR[status]
            }
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Hover or Selected Floating CAD Label */}
      {(isHovered || isSelected || (showLabel && status !== "Normal")) && (
        <Html
          position={[0, isHorizontal ? 2.2 : height + 0.9, 0]}
          center
          distanceFactor={26}
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0F172A] shadow-card">
            <span className="font-mono text-[#4B6BFB]">{tank.code}</span>
            <span className="mx-1.5 text-[#CBD5E1]">|</span>
            <span>{status}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Clickable Operational Structures: Pumping Stations, Loading Gantries, Buildings,
 * Utility Cooling Towers, Emergency Exits, and Assembly Points.
 */
function SelectableFacilityBuilding3D({
  asset,
  scenario,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  showLabel,
}: {
  asset: TwinFacilityObject;
  scenario: TwinScenarioConfig;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
  showLabel: boolean;
}) {
  const { status } = getAssetStatus(asset, scenario);
  const [w, h, d] = asset.dimensions;

  const baseColor =
    status === "Critical"
      ? "#FECACA"
      : status === "Warning"
        ? "#FDE68A"
        : CATEGORY_ACCENT_COLOR[asset.category];

  const edgeColor = isSelected
    ? "#2563EB"
    : isHovered
      ? "#0284C7"
      : status === "Critical"
        ? "#DC2626"
        : status === "Warning"
          ? "#D97706"
          : "#475569";

  const ringRadius = Math.max(w, d) * 0.62;

  return (
    <group
      position={asset.position}
      rotation={[0, asset.rotationY ?? 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setCursorPointer(true);
        onHover(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setCursorPointer(false);
        onHover(false);
      }}
    >
      {/* Specialized Detailed Architecture Per Asset ID */}
      {asset.id === "LOAD-GANTRY" ? (
        <group>
          {/* Steel canopy roof */}
          <mesh position={[0, h, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.24, d]} />
            <meshStandardMaterial color={status === "Normal" ? "#FFFFFF" : baseColor} roughness={0.35} />
            <Edges threshold={15} color={edgeColor} />
          </mesh>
          {/* Safety stripe fascia */}
          <mesh position={[0, h - 0.14, 0]}>
            <boxGeometry args={[w + 0.04, 0.08, d + 0.04]} />
            <meshStandardMaterial color="#2563EB" />
          </mesh>
          {/* 6 Canopy Support Columns */}
          {[
            [-w * 0.42, -d * 0.36],
            [0, -d * 0.36],
            [w * 0.42, -d * 0.36],
            [-w * 0.42, d * 0.36],
            [0, d * 0.36],
            [w * 0.42, d * 0.36],
          ].map(([cx, cz], i) => (
            <mesh key={i} position={[cx, h / 2, cz]} castShadow>
              <cylinderGeometry args={[0.1, 0.12, h, 8]} />
              <meshStandardMaterial color="#64748B" />
            </mesh>
          ))}
          {/* Loading Pump Islands + Flexible Loading Arms */}
          {[-1.5, 1.5].map((ix, i) => (
            <mesh key={i} position={[ix, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.55, 0.9, d * 0.65]} />
              <meshStandardMaterial color="#E2E8F0" />
              <Edges threshold={15} color="#475569" />
            </mesh>
          ))}
          {/* Tanker Truck Inside Bay 1 + Approaching Bay 2 */}
          <FuelTankerTruck3D position={[-0.2, 0, -0.8]} rotationY={0} scale={0.95} />
          <FuelTankerTruck3D position={[-2.9, 0, 1.2]} rotationY={0.28} scale={0.95} />
        </group>
      ) : asset.id === "PUMP-MAIN" || asset.id === "PUMP-BOOSTER" ? (
        <group>
          {/* Concrete pump pad */}
          <mesh position={[0, 0.1, 0]} receiveShadow>
            <boxGeometry args={[w, 0.2, d]} />
            <meshStandardMaterial color="#CBD5E1" />
            <Edges threshold={15} color={edgeColor} />
          </mesh>
          {/* Pump motors & volute casings */}
          {[-1.2, 0, 1.2].map((px, i) => (
            <group key={i} position={[px, 0.55, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.72, 0.65, 1.3]} />
                <meshStandardMaterial color={status === "Normal" ? "#FFFFFF" : baseColor} />
                <Edges threshold={15} color={edgeColor} />
              </mesh>
              <mesh position={[0, 0.48, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.24, 0.24, 0.85, 12]} />
                <meshStandardMaterial color="#64748B" metalness={0.35} />
              </mesh>
            </group>
          ))}
          {/* Header Pipe Arch */}
          <mesh position={[0, 1.22, -d * 0.28]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, w * 0.85, 12]} />
            <meshStandardMaterial color="#3B82F6" />
          </mesh>
        </group>
      ) : asset.id === "BLD-UTIL" ? (
        <group>
          {/* Twin Industrial Cooling Tower Units */}
          {[-1.95, 1.95].map((cz, i) => (
            <group key={i} position={[0, 0, cz]}>
              <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w * 0.92, h, 3.0]} />
                <meshStandardMaterial color={status === "Normal" ? "#FFFFFF" : baseColor} />
                <Edges threshold={15} color={edgeColor} />
              </mesh>
              {/* Fan Shroud Stack */}
              <mesh position={[0, h + 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.85, 1.0, 0.6, 16]} />
                <meshStandardMaterial color="#E2E8F0" />
                <Edges threshold={15} color={edgeColor} />
              </mesh>
            </group>
          ))}
        </group>
      ) : asset.category === "Emergency Exit" ? (
        <group>
          {/* Green Safety Portal Pillars & Overhead Sign Beam */}
          <mesh position={[-w * 0.4, h / 2, 0]} castShadow>
            <boxGeometry args={[0.2, h, 0.28]} />
            <meshStandardMaterial color={status === "Critical" ? "#EF4444" : "#10B981"} />
            <Edges threshold={15} color="#065F46" />
          </mesh>
          <mesh position={[w * 0.4, h / 2, 0]} castShadow>
            <boxGeometry args={[0.2, h, 0.28]} />
            <meshStandardMaterial color={status === "Critical" ? "#EF4444" : "#10B981"} />
            <Edges threshold={15} color="#065F46" />
          </mesh>
          <mesh position={[0, h + 0.1, 0]} castShadow>
            <boxGeometry args={[w + 0.35, 0.35, 0.35]} />
            <meshStandardMaterial color={status === "Critical" ? "#DC2626" : "#059669"} />
            <Edges threshold={15} color="#064E3B" />
          </mesh>
        </group>
      ) : asset.category === "Assembly Point" ? (
        <group>
          {/* Raised Muster Safe Pad */}
          <mesh position={[0, 0.08, 0]} receiveShadow>
            <boxGeometry args={[w, 0.14, d]} />
            <meshStandardMaterial
              color={status === "Warning" ? "#FEF3C7" : "#DCFCE7"}
              roughness={0.75}
            />
            <Edges threshold={15} color={status === "Warning" ? "#D97706" : "#16A34A"} />
          </mesh>
          {/* Inner Cross / Safe Circle Pad */}
          <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 1.15, 24]} />
            <meshBasicMaterial
              color={status === "Warning" ? "#D97706" : "#16A34A"}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Assembly Signpost Flag */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 2.3, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 2.15, 0]}>
            <boxGeometry args={[1.1, 0.6, 0.14]} />
            <meshStandardMaterial color={status === "Warning" ? "#F59E0B" : "#16A34A"} />
            <Edges threshold={15} color="#14532D" />
          </mesh>
        </group>
      ) : (
        /* Standard Operational Building (Control Room, Office, Maintenance, Metering) */
        <group>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial
              color={status === "Normal" ? "#FFFFFF" : baseColor}
              roughness={0.4}
            />
            <Edges threshold={15} color={edgeColor} />
          </mesh>
          {/* Slanted / Stepped Architectural Roof Cap */}
          <mesh position={[0, h + 0.16, 0]} castShadow>
            <boxGeometry args={[w + 0.25, 0.22, d + 0.25]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
            <Edges threshold={15} color={edgeColor} />
          </mesh>
          {/* HVAC Rooftop Units */}
          <mesh position={[w * 0.22, h + 0.42, 0]}>
            <boxGeometry args={[0.85, 0.35, 0.85]} />
            <meshStandardMaterial color="#CBD5E1" />
            <Edges threshold={15} color="#475569" />
          </mesh>
          {/* Control Room Observation Windows / Accent Glazing */}
          <mesh position={[0, h * 0.58, d / 2 + 0.02]}>
            <boxGeometry args={[w * 0.72, h * 0.32, 0.04]} />
            <meshStandardMaterial color="#38BDF8" roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* Selection / Hover / Alert Outline Ring */}
      {(isSelected || isHovered || status !== "Normal") && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringRadius, ringRadius + 0.24, 32]} />
          <meshBasicMaterial
            color={
              isSelected
                ? "#2563EB"
                : isHovered
                  ? "#0EA5E9"
                  : STATUS_RING_COLOR[status]
            }
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Hover / Selected / Critical Floating Label */}
      {(isHovered || isSelected || (showLabel && status !== "Normal") || asset.category === "Assembly Point") && (
        <Html
          position={[0, h + 0.95, 0]}
          center
          distanceFactor={28}
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-md border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#0F172A] shadow-card">
            <span className="font-mono text-[#4B6BFB]">{asset.code}</span>
            {(isHovered || isSelected || status !== "Normal") && (
              <>
                <span className="mx-1 text-[#CBD5E1]">·</span>
                <span>{asset.category === "Assembly Point" ? asset.name.split(" (")[0] : status}</span>
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export function DepotAssets3D({
  scenario,
  selectedObjectId,
  hoveredObjectId,
  onSelectObject,
  onHoverObject,
  showLabels = true,
}: DepotAssets3DProps) {
  return (
    <group>
      <DepotEnvironmentAndInfrastructure />
      {ALL_TWIN_ENTITIES.map((entity) =>
        entity.category === "Storage Tank" ? (
          <SelectableTank3D
            key={entity.id}
            tank={entity}
            scenario={scenario}
            isSelected={selectedObjectId === entity.id}
            isHovered={hoveredObjectId === entity.id}
            onSelect={() => onSelectObject(entity.id)}
            onHover={(hover) =>
              onHoverObject(hover ? entity.id : hoveredObjectId === entity.id ? null : hoveredObjectId)
            }
            showLabel={showLabels}
          />
        ) : (
          <SelectableFacilityBuilding3D
            key={entity.id}
            asset={entity}
            scenario={scenario}
            isSelected={selectedObjectId === entity.id}
            isHovered={hoveredObjectId === entity.id}
            onSelect={() => onSelectObject(entity.id)}
            onHover={(hover) =>
              onHoverObject(hover ? entity.id : hoveredObjectId === entity.id ? null : hoveredObjectId)
            }
            showLabel={showLabels}
          />
        )
      )}
    </group>
  );
}
