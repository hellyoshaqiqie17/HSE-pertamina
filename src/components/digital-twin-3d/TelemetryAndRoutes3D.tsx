"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Edges, Html, Line } from "@react-three/drei";
import {
  DEPOT_NAV_NODES,
  HazardZoneSpec,
  TWIN_SENSORS,
  TwinScenarioConfig,
  TwinSensorNode,
  TwinSensorType,
  TwinStatus,
  getSensorReading,
} from "./depot-twin-data";

export const SENSOR_TYPE_COLORS: Record<TwinSensorType, string> = {
  gas: "#EAB308", // Yellow
  temperature: "#F97316", // Orange
  smoke: "#64748B", // Gray
  fire: "#EF4444", // Red
  wind: "#06B6D4", // Cyan
};

export const ROUTE_STATUS_COLORS: Record<
  "recommended" | "caution" | "blocked" | "normal",
  string
> = {
  recommended: "#10B981", // Green
  caution: "#F59E0B", // Yellow
  blocked: "#EF4444", // Red
  normal: "#2563EB", // Blue
};

function setCursorPointer(active: boolean) {
  if (typeof document !== "undefined") {
    document.body.style.cursor = active ? "pointer" : "auto";
  }
}

function samplePolylinePoint(
  points: [number, number, number][],
  t: number
): { pos: THREE.Vector3; dir: THREE.Vector3 } {
  if (points.length < 2) {
    return {
      pos: new THREE.Vector3(...(points[0] ?? [0, 0.3, 0])),
      dir: new THREE.Vector3(1, 0, 0),
    };
  }

  let totalLen = 0;
  const segLens: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = new THREE.Vector3(...points[i]);
    const b = new THREE.Vector3(...points[i + 1]);
    const d = a.distanceTo(b);
    segLens.push(d);
    totalLen += d;
  }

  const targetDist = (((t % 1) + 1) % 1) * Math.max(totalLen, 0.001);
  let accum = 0;
  for (let i = 0; i < segLens.length; i++) {
    const segLen = segLens[i];
    if (accum + segLen >= targetDist || i === segLens.length - 1) {
      const localT = segLen > 0 ? (targetDist - accum) / segLen : 0;
      const a = new THREE.Vector3(...points[i]);
      const b = new THREE.Vector3(...points[i + 1]);
      const pos = a.clone().lerp(b, THREE.MathUtils.clamp(localT, 0, 1));
      const dir = b.clone().sub(a).normalize();
      return { pos, dir };
    }
    accum += segLen;
  }
  return {
    pos: new THREE.Vector3(...points[0]),
    dir: new THREE.Vector3(1, 0, 0),
  };
}

/**
 * Individual Interactive Sensor Marker
 */
function SensorMarker3D({
  sensor,
  value,
  status,
  windSpeedMps,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  sensor: TwinSensorNode;
  value: number;
  status: TwinStatus;
  windSpeedMps: number;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
}) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const rotorRef = useRef<THREE.Group>(null);

  const color = SENSOR_TYPE_COLORS[sensor.type];
  const [x, y, z] = sensor.position;

  useFrame(({ clock }, delta) => {
    if (pulseRef.current && (status !== "Normal" || isSelected)) {
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * (status === "Critical" ? 5.5 : 3.2)) * 0.24;
      pulseRef.current.scale.set(s, s, 1);
    }
    if (rotorRef.current && sensor.type === "wind") {
      rotorRef.current.rotation.y += delta * Math.max(1.8, windSpeedMps * 1.15);
    }
  });

  // Ground post height down from sensor mount
  const postHeight = Math.max(y - 0.1, 0.8);

  return (
    <group
      position={[x, 0, z]}
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
      {/* Slim Sensor Pole */}
      <mesh position={[0, postHeight / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.055, postHeight, 8]} />
        <meshStandardMaterial color="#64748B" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Sensor Head by Category */}
      <group position={[0, y, 0]}>
        {sensor.type === "gas" && (
          <mesh scale={isSelected || isHovered ? 1.25 : 1} castShadow>
            <octahedronGeometry args={[0.38, 0]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
            <Edges threshold={15} color="#713F12" />
          </mesh>
        )}

        {sensor.type === "temperature" && (
          <mesh scale={isSelected || isHovered ? 1.25 : 1} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.56, 14]} />
            <meshStandardMaterial color={color} roughness={0.25} />
            <Edges threshold={15} color="#7C2D12" />
          </mesh>
        )}

        {sensor.type === "smoke" && (
          <mesh scale={isSelected || isHovered ? 1.25 : 1} castShadow>
            <cylinderGeometry args={[0.36, 0.26, 0.36, 16]} />
            <meshStandardMaterial color={color} roughness={0.35} />
            <Edges threshold={15} color="#1E293B" />
          </mesh>
        )}

        {sensor.type === "fire" && (
          <mesh scale={isSelected || isHovered ? 1.25 : 1} castShadow>
            <coneGeometry args={[0.34, 0.62, 6]} />
            <meshStandardMaterial color={color} roughness={0.25} />
            <Edges threshold={15} color="#7F1D1D" />
          </mesh>
        )}

        {sensor.type === "wind" && (
          <group scale={isSelected || isHovered ? 1.2 : 1}>
            {/* Anemometer hub */}
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.26, 0.38, 12]} />
              <meshStandardMaterial color={color} roughness={0.25} />
              <Edges threshold={15} color="#164E63" />
            </mesh>
            {/* Spinning 3-Cup Rotor */}
            <group ref={rotorRef} position={[0, 0.34, 0]}>
              {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((ang, idx) => (
                <group key={idx} rotation={[0, ang, 0]}>
                  <mesh position={[0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.025, 0.025, 0.52, 6]} />
                    <meshStandardMaterial color="#0E7490" />
                  </mesh>
                  <mesh position={[0.52, 0, 0]}>
                    <sphereGeometry args={[0.09, 8, 8]} />
                    <meshStandardMaterial color="#06B6D4" />
                  </mesh>
                </group>
              ))}
            </group>
            {/* Wind Direction Vane pointing NW -> SE (+x, +z) */}
            <group position={[0, -0.34, 0]} rotation={[0, -Math.atan2(0.68, 0.72), 0]}>
              <mesh position={[0.28, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <cylinderGeometry args={[0.025, 0.025, 0.68, 6]} />
                <meshStandardMaterial color="#0891B2" />
              </mesh>
              <mesh position={[0.64, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.1, 0.22, 8]} />
                <meshStandardMaterial color="#06B6D4" />
              </mesh>
            </group>
          </group>
        )}
      </group>

      {/* Alert or Selected Ground/Mount Halo */}
      {(status !== "Normal" || isSelected || isHovered) && (
        <mesh
          ref={pulseRef}
          position={[0, 0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.42, 0.68, 24]} />
          <meshBasicMaterial
            color={
              isSelected
                ? "#2563EB"
                : status === "Critical"
                  ? "#EF4444"
                  : status === "Warning"
                    ? "#F59E0B"
                    : color
            }
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Hover / Selected / Alert Label */}
      {(isHovered || isSelected || status !== "Normal") && (
        <Html
          position={[0, y + 0.85, 0]}
          center
          distanceFactor={26}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-semibold shadow-card ${
              status === "Critical"
                ? "border-red-300 bg-red-50 text-red-900"
                : status === "Warning"
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : "border-[#E2E8F0] bg-white text-[#0F172A]"
            }`}
          >
            <span className="font-mono font-bold">{sensor.code}</span>
            <span className="mx-1 opacity-40">|</span>
            <span>
              {value} {sensor.unit}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Animated Conceptual Hazard Zone & Wind Dispersion Plume Envelope
 */
function HazardPlumeMesh({ hazard }: { hazard: HazardZoneSpec }) {
  const volumeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const puffGroupRef = useRef<THREE.Group>(null);

  const colorMap = {
    gas: "#F59E0B",
    fire: "#EF4444",
    smoke: "#475569",
  };
  const color = colorMap[hazard.type];

  const { rotY, stretchLen, dx, dz } = useMemo(() => {
    if (!hazard.windStretch) {
      return { rotY: 0, stretchLen: 1, dx: 0, dz: 0 };
    }
    const len = Math.hypot(hazard.windStretch.dx, hazard.windStretch.dz) || 1;
    const ndx = hazard.windStretch.dx / len;
    const ndz = hazard.windStretch.dz / len;
    return {
      rotY: -Math.atan2(ndz, ndx),
      stretchLen: hazard.windStretch.lengthMultiplier,
      dx: ndx,
      dz: ndz,
    };
  }, [hazard.windStretch]);

  // Offset plume center downwind when stretched by wind
  const centerOffsetX = hazard.windStretch ? dx * hazard.radius * 0.55 : 0;
  const centerOffsetZ = hazard.windStretch ? dz * hazard.radius * 0.55 : 0;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (volumeRef.current) {
      const breath = 1 + Math.sin(t * 2.2) * 0.04;
      volumeRef.current.scale.set(
        hazard.radius * stretchLen * breath,
        hazard.height * (1 + Math.sin(t * 2.8) * 0.05),
        hazard.radius * breath
      );
    }
    if (ringRef.current) {
      const pulse = 1 + Math.sin(t * 3.0) * 0.035;
      ringRef.current.scale.set(
        hazard.radius * stretchLen * pulse,
        hazard.radius * pulse,
        1
      );
    }
    if (puffGroupRef.current && hazard.windStretch) {
      puffGroupRef.current.children.forEach((child, idx) => {
        const progress = ((t * 0.28 + idx * 0.25) % 1);
        child.position.set(
          progress * hazard.radius * stretchLen * 1.4,
          0.9 + Math.sin(t * 2 + idx) * 0.35 + progress * 0.9,
          Math.sin(idx * 1.7 + t) * (hazard.radius * 0.32)
        );
        const s = 0.7 + progress * 0.9;
        child.scale.set(s, s * 0.75, s);
      });
    }
  });

  return (
    <group
      position={[
        hazard.center[0] + centerOffsetX,
        0,
        hazard.center[2] + centerOffsetZ,
      ]}
      rotation={[0, rotY, 0]}
    >
      {/* Translucent Dome / Ellipsoid Hazard Envelope */}
      <mesh ref={volumeRef} position={[0, hazard.height * 0.25, 0]}>
        <sphereGeometry args={[1, 28, 18]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hazard.type === "fire" ? 0.3 : 0.24}
          depthWrite={false}
          roughness={0.7}
        />
      </mesh>

      {/* Core Hot Spot Circle */}
      <mesh
        position={[-centerOffsetX, 0.14, -centerOffsetZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[hazard.radius * 0.35, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer Hazard Footprint Perimeter Ring */}
      <mesh
        ref={ringRef}
        position={[0, 0.13, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.92, 1.0, 40]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Drifting Wind Puffs + Directional Plume Vector Indicator */}
      {hazard.windStretch && (
        <>
          <group
            ref={puffGroupRef}
            position={[-centerOffsetX * 0.65, 0, -centerOffsetZ * 0.65]}
          >
            {[0, 1, 2, 3].map((idx) => (
              <mesh key={idx}>
                <sphereGeometry args={[1.15, 14, 12]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.14}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
          {/* Floating Wind Dispersion Vector Arrow above Hazard */}
          <group position={[hazard.radius * 0.5, hazard.height + 1.1, 0]}>
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 3.6, 8]} />
              <meshBasicMaterial color="#0284C7" />
            </mesh>
            <mesh position={[2.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.32, 0.8, 10]} />
              <meshBasicMaterial color="#0284C7" />
            </mesh>
          </group>
        </>
      )}

      {/* Hazard Callout Pill */}
      <Html
        position={[0, hazard.height + 0.6, 0]}
        center
        distanceFactor={28}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-bold shadow-card ${
            hazard.type === "fire"
              ? "border-red-500 bg-red-600 text-white"
              : hazard.type === "gas"
                ? "border-amber-400 bg-amber-500 text-slate-950"
                : "border-slate-500 bg-slate-700 text-white"
          }`}
        >
          {hazard.label}
        </div>
      </Html>
    </group>
  );
}

/**
 * Animated Flow Arrows Along Recommended Safe Evacuation Corridors
 */
const UP_AXIS = new THREE.Vector3(0, 1, 0);

function AnimatedRouteArrows({
  waypoints,
  color,
}: {
  waypoints: [number, number, number][];
  color: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const arrowOffsets = useMemo(() => [0.1, 0.35, 0.6, 0.85], []);
  const flatDir = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * 0.24;
    groupRef.current.children.forEach((child, idx) => {
      const sample = samplePolylinePoint(waypoints, arrowOffsets[idx] + t);
      child.position.set(sample.pos.x, sample.pos.y + 0.14, sample.pos.z);
      flatDir.set(sample.dir.x, 0, sample.dir.z);
      if (flatDir.lengthSq() > 0.0001) {
        flatDir.normalize();
        child.quaternion.setFromUnitVectors(UP_AXIS, flatDir);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {arrowOffsets.map((_, idx) => (
        <mesh key={idx}>
          <coneGeometry args={[0.26, 0.65, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function TelemetryAndRoutes3D({
  scenario,
  selectedSensorId,
  hoveredSensorId,
  onSelectSensor,
  onHoverSensor,
  showSensors,
  showHazards,
  showRoutes,
}: {
  scenario: TwinScenarioConfig;
  selectedSensorId: string | null;
  hoveredSensorId: string | null;
  onSelectSensor: (id: string) => void;
  onHoverSensor: (id: string | null) => void;
  showSensors: boolean;
  showHazards: boolean;
  showRoutes: boolean;
}) {
  const workerStartNodes = useMemo(
    () => DEPOT_NAV_NODES.filter((n) => n.kind === "worker-start"),
    []
  );

  return (
    <group>
      {/* IoT Sensors */}
      {showSensors &&
        TWIN_SENSORS.map((sensor) => {
          const reading = getSensorReading(sensor, scenario);
          return (
            <SensorMarker3D
              key={sensor.id}
              sensor={sensor}
              value={reading.value}
              status={reading.status}
              windSpeedMps={scenario.windSpeedMps}
              isSelected={selectedSensorId === sensor.id}
              isHovered={hoveredSensorId === sensor.id}
              onSelect={() => onSelectSensor(sensor.id)}
              onHover={(hover) =>
                onHoverSensor(
                  hover ? sensor.id : hoveredSensorId === sensor.id ? null : hoveredSensorId
                )
              }
            />
          );
        })}

      {/* Hazard Plume & Radiation Overlays */}
      {showHazards &&
        scenario.hazards.map((hazard) => (
          <HazardPlumeMesh key={hazard.id} hazard={hazard} />
        ))}

      {/* Adaptive Evacuation Routes & Worker Starting Positions */}
      {showRoutes && (
        <group>
          {/* Worker Crew Starting Beacons */}
          {workerStartNodes.map((node) => (
            <group key={node.id} position={node.position}>
              <mesh position={[0, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.28, 0.34, 0.7, 12]} />
                <meshStandardMaterial color="#1D4ED8" roughness={0.35} />
                <Edges threshold={15} color="#1E3A8A" />
              </mesh>
              <mesh position={[0, 0.85, 0]} castShadow>
                <sphereGeometry args={[0.22, 12, 12]} />
                <meshStandardMaterial color="#F8FAFC" />
              </mesh>
              <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.42, 0.56, 20]} />
                <meshBasicMaterial color="#2563EB" side={THREE.DoubleSide} />
              </mesh>
            </group>
          ))}

          {/* Dynamic Color-Coded Route Corridors */}
          {scenario.recommendedRoutePaths.map((route) => {
            const color = ROUTE_STATUS_COLORS[route.status];
            const isDashed =
              route.status === "blocked" || route.status === "caution";
            const midSample = samplePolylinePoint(route.waypoints, 0.5);

            return (
              <group key={route.id}>
                <Line
                  points={route.waypoints}
                  color={color}
                  lineWidth={route.status === "recommended" ? 4.2 : 3.2}
                  dashed={isDashed}
                  dashSize={0.75}
                  gapSize={0.45}
                />

                {/* Animated Arrows along Active Green Safe Routes (or Blue normal corridors) */}
                {(route.status === "recommended" || route.status === "normal") && (
                  <AnimatedRouteArrows
                    waypoints={route.waypoints}
                    color={color}
                  />
                )}

                {/* Blocked Route Red X Barricade Marker */}
                {route.status === "blocked" && (
                  <group
                    position={[midSample.pos.x, 0.55, midSample.pos.z]}
                    rotation={[0, Math.PI / 4, 0]}
                  >
                    <mesh castShadow>
                      <boxGeometry args={[1.25, 0.26, 0.22]} />
                      <meshStandardMaterial color="#DC2626" />
                    </mesh>
                    <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
                      <boxGeometry args={[1.25, 0.26, 0.22]} />
                      <meshStandardMaterial color="#DC2626" />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
}
