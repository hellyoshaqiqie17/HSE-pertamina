"use client";

import React, { Component, Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DepotAssets3D } from "./DepotAssets3D";
import { TelemetryAndRoutes3D } from "./TelemetryAndRoutes3D";
import { CAMERA_PRESETS, CameraPresetId, TwinScenarioConfig } from "./depot-twin-data";

export interface CameraRequest {
  id: number;
  position: [number, number, number];
  target: [number, number, number];
}

export interface ZoomRequest {
  id: number;
  direction: "in" | "out";
}

interface DepotSceneCanvasProps {
  scenario: TwinScenarioConfig;
  selectedObjectId: string | null;
  selectedSensorId: string | null;
  hoveredObjectId: string | null;
  hoveredSensorId: string | null;
  onSelectObject: (id: string) => void;
  onSelectSensor: (id: string) => void;
  onHoverObject: (id: string | null) => void;
  onHoverSensor: (id: string | null) => void;
  onClearSelection: () => void;
  cameraRequest: CameraRequest | null;
  zoomRequest: ZoomRequest | null;
  showSensors: boolean;
  showHazards: boolean;
  showRoutes: boolean;
  showLabels: boolean;
}

class CanvasErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <p className="text-sm font-semibold text-slate-900">
            3D WebGL Viewport Unavailable
          </p>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            Please ensure hardware acceleration / WebGL is enabled in your browser to interact with the 3D EVORA Digital Twin.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function CameraRig({
  cameraRequest,
  zoomRequest,
}: {
  cameraRequest: CameraRequest | null;
  zoomRequest: ZoomRequest | null;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  const desiredPos = useRef(new THREE.Vector3(...CAMERA_PRESETS[0].position));
  const desiredTarget = useRef(new THREE.Vector3(...CAMERA_PRESETS[0].target));
  const isTransitioning = useRef(false);

  const lastCamReqId = useRef<number>(0);
  const lastZoomReqId = useRef<number>(0);

  useEffect(() => {
    if (cameraRequest && cameraRequest.id !== lastCamReqId.current) {
      lastCamReqId.current = cameraRequest.id;
      desiredPos.current.set(...cameraRequest.position);
      desiredTarget.current.set(...cameraRequest.target);
      isTransitioning.current = true;
    }
  }, [cameraRequest]);

  useEffect(() => {
    if (!zoomRequest || zoomRequest.id === lastZoomReqId.current) return;
    lastZoomReqId.current = zoomRequest.id;

    const currentTarget = controlsRef.current
      ? controlsRef.current.target.clone()
      : desiredTarget.current.clone();

    const offset = camera.position.clone().sub(currentTarget);
    const factor = zoomRequest.direction === "in" ? 0.78 : 1.28;
    const nextLength = THREE.MathUtils.clamp(offset.length() * factor, 11, 78);
    offset.setLength(nextLength);

    desiredTarget.current.copy(currentTarget);
    desiredPos.current.copy(currentTarget).add(offset);
    isTransitioning.current = true;
  }, [zoomRequest, camera]);

  useFrame((_, delta) => {
    if (!controlsRef.current || !isTransitioning.current) return;

    const step = 1 - Math.exp(-delta * 6.5);
    camera.position.lerp(desiredPos.current, step);
    controlsRef.current.target.lerp(desiredTarget.current, step);
    controlsRef.current.update();

    if (
      camera.position.distanceTo(desiredPos.current) < 0.06 &&
      controlsRef.current.target.distanceTo(desiredTarget.current) < 0.06
    ) {
      camera.position.copy(desiredPos.current);
      controlsRef.current.target.copy(desiredTarget.current);
      controlsRef.current.update();
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan
      enableZoom
      minDistance={11}
      maxDistance={78}
      minPolarAngle={0.22}
      maxPolarAngle={Math.PI / 2.15}
      target={CAMERA_PRESETS[0].target}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
}

export function DepotSceneCanvas(props: DepotSceneCanvasProps) {
  const defaultPreset =
    CAMERA_PRESETS.find((p) => p.id === ("overview" as CameraPresetId)) ??
    CAMERA_PRESETS[0];

  return (
    <CanvasErrorBoundary>
      <div className="relative h-full w-full select-none bg-[#F8FAFC]">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{
            position: defaultPreset.position,
            fov: 35,
            near: 0.5,
            far: 240,
          }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onPointerMissed={() => props.onClearSelection()}
        >
          <color attach="background" args={["#F8FAFC"]} />
          <fog attach="fog" args={["#F8FAFC", 72, 165]} />

          {/* Crisp Daylight Engineering Lighting */}
          <ambientLight intensity={0.78} />
          <hemisphereLight args={["#FFFFFF", "#E2E8F0", 0.55]} />
          <directionalLight
            position={[36, 48, 28]}
            intensity={1.05}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-32}
            shadow-camera-right={32}
            shadow-camera-top={32}
            shadow-camera-bottom={-32}
            shadow-camera-near={5}
            shadow-camera-far={130}
            shadow-bias={-0.0005}
          />
          <directionalLight position={[-28, 24, -22]} intensity={0.35} />

          <Suspense fallback={null}>
            <CameraRig
              cameraRequest={props.cameraRequest}
              zoomRequest={props.zoomRequest}
            />

            <DepotAssets3D
              scenario={props.scenario}
              selectedObjectId={props.selectedObjectId}
              hoveredObjectId={props.hoveredObjectId}
              onSelectObject={props.onSelectObject}
              onHoverObject={props.onHoverObject}
              showLabels={props.showLabels}
            />

            <TelemetryAndRoutes3D
              scenario={props.scenario}
              selectedSensorId={props.selectedSensorId}
              hoveredSensorId={props.hoveredSensorId}
              onSelectSensor={props.onSelectSensor}
              onHoverSensor={props.onHoverSensor}
              showSensors={props.showSensors}
              showHazards={props.showHazards}
              showRoutes={props.showRoutes}
            />
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
