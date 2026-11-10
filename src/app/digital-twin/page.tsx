"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Compass,
  Eye,
  RotateCcw,
  StepForward,
  Wind,
} from "lucide-react";
import { useEvora } from "@/lib/evora-context";
import {
  RiskBadge,
  SensorStatusBadge,
} from "@/components/shared/status-badge";
import { UIStateWrapper } from "@/components/shared/ui-state-wrapper";
import {
  DEFAULT_MAP_LAYERS,
  FacilitySchematicMap,
  MapLayerVisibility,
} from "@/components/shared/facility-schematic-map";
import { DepotTechnicalStage } from "@/components/shared/depot-technical-stage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const REPLAY_TIMELINE_STEPS = [
  {
    step: 0,
    timeLabel: "09:35 WIB (T-15m · Early Vapor Detection)",
    summary:
      "Initial hydrocarbon vapor trace (14.8% LEL) detected near Tank T-102 manifold. All evacuation corridors remain below risk threshold.",
    radiusScale: 0.65,
    includeWestExpansion: false,
  },
  {
    step: 1,
    timeLabel: "09:45 WIB (T-05m · Plume Drift Across Central Manifold)",
    summary:
      "SE coastal wind (4.8 m/s) pushes vapor plume (38.0% LEL) and smoke across Route C (East Shortcut). Route A remains safe and recommended.",
    radiusScale: 1.0,
    includeWestExpansion: false,
  },
  {
    step: 2,
    timeLabel: "09:53 WIB (T-00m · Westward Relief Valve Expansion)",
    summary:
      "Secondary pressure relief release expands vapor zone across North-West Service Road (58.0% LEL). Route A becomes blocked; EVORA promotes Route B.",
    radiusScale: 1.2,
    includeWestExpansion: true,
  },
];

export default function DigitalTwinPage() {
  const {
    currentFacility,
    assets,
    sensors,
    hazards,
    routes,
    workers,
    triggerHazardExpansion,
    resetDemoState,
    hazardExpansionStep,
  } = useEvora();

  const [layers, setLayers] = useState<MapLayerVisibility>(DEFAULT_MAP_LAYERS);
  const [replayIndex, setReplayIndex] = useState<number>(
    hazardExpansionStep > 0 ? 2 : 1
  );
  const [selectedAssetTab, setSelectedAssetTab] = useState<
    "assets" | "hazards" | "sensors"
  >("assets");

  const handleToggleLayer = (key: keyof MapLayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSetAllLayers = (enabled: boolean) => {
    setLayers({
      assets: enabled,
      sensors: enabled,
      gas: enabled,
      temperature: enabled,
      smokeFire: enabled,
      wind: enabled,
      workers: enabled,
      riskZones: enabled,
      routes: enabled,
    });
  };

  const currentReplay = REPLAY_TIMELINE_STEPS[replayIndex];

  const replayAdjustedHazards = hazards.map((h) => {
    if (h.id === "HAZ-WEST-EXP") {
      const shouldShow =
        currentReplay.includeWestExpansion || hazardExpansionStep > 0;
      return {
        ...h,
        active: shouldShow,
        radius: shouldShow ? 98 : 0,
      };
    }
    return {
      ...h,
      radius: Math.round(h.baseRadius * currentReplay.radiusScale),
    };
  });

  const handleStepReplay = () => {
    const nextIdx = (replayIndex + 1) % REPLAY_TIMELINE_STEPS.length;
    setReplayIndex(nextIdx);
    if (nextIdx === 2 && hazardExpansionStep === 0) {
      triggerHazardExpansion();
    } else if (nextIdx === 0 && hazardExpansionStep > 0) {
      resetDemoState();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Multi-Plane Elevation & Isometric Stage */}
      <DepotTechnicalStage
        stageTitle="Digital Twin"
        stageNumber="#102"
        defaultPlane="front"
      />

      <UIStateWrapper pageTitle="Digital Twin Monitoring">
        {/* Time-Step Sensor & Plume Replay Control Bar */}
        <Card
          aria-labelledby="twin-replay-heading"
          className="p-5 sm:p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Clock
                  className="w-4 h-4 text-[#52525B] shrink-0"
                  aria-hidden="true"
                />
                <h2
                  id="twin-replay-heading"
                  className="text-sm sm:text-base font-semibold text-[#18181B]"
                >
                  Time-Series Plume Replay ·{" "}
                  <span className="font-mono font-normal text-[#52525B]">
                    {currentReplay.timeLabel}
                  </span>
                </h2>
              </div>
              <p className="text-xs text-[#68686F]">
                {currentReplay.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="inline-flex p-1 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] gap-1">
                {REPLAY_TIMELINE_STEPS.map((st, idx) => (
                  <button
                    key={st.step}
                    type="button"
                    onClick={() => {
                      setReplayIndex(idx);
                      if (idx === 2 && hazardExpansionStep === 0) {
                        triggerHazardExpansion();
                      }
                    }}
                    aria-pressed={replayIndex === idx}
                    className={`px-3 py-1.5 h-8 rounded-lg text-xs font-mono font-medium transition-colors ${
                      replayIndex === idx
                        ? "bg-white text-[#18181B] shadow-xs border border-[#E2E2DE]"
                        : "text-[#68686F] hover:text-[#18181B]"
                    }`}
                  >
                    {idx === 0 ? "T-15m" : idx === 1 ? "T-05m" : "T-00m"}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="embossed"
                onClick={handleStepReplay}
              >
                <StepForward className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Step Replay</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSetAllLayers(true)}
              >
                <Eye className="w-3.5 h-3.5 text-[#52525B]" aria-hidden="true" />
                <span>All Layers</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setReplayIndex(1);
                  resetDemoState();
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Asymmetric Digital Twin Workspace: 2D/3D Layer Map (8 cols) + Registry & Legend (4 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8">
            <FacilitySchematicMap
              facilityName={currentFacility.name}
              facilityCode={currentFacility.code}
              windSpeedMps={currentFacility.windSpeedMps}
              windDirectionDeg={currentFacility.windDirectionDeg}
              windDirectionLabel={currentFacility.windDirectionLabel}
              assets={assets}
              sensors={sensors}
              hazards={replayAdjustedHazards}
              routes={routes}
              workers={workers}
              layers={layers}
              onToggleLayer={handleToggleLayer}
              showLayerToolbar={true}
              showViewModeToggle={true}
            />
          </div>

          <div className="xl:col-span-4 space-y-5">
            <Card
              aria-labelledby="hazard-legend-heading"
              className="p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EFEFEA]">
                <h2
                  id="hazard-legend-heading"
                  className="text-sm font-semibold text-[#18181B] flex items-center gap-2"
                >
                  <Wind
                    className="w-4 h-4 text-[#52525B]"
                    aria-hidden="true"
                  />
                  <span>Multi-Hazard Telemetry Envelope</span>
                </h2>
                <span className="text-[11px] font-mono text-[#68686F]">
                  {currentFacility.windSpeedMps} m/s{" "}
                  {currentFacility.windDirectionLabel}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-[#18181B] flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C84B28]" aria-hidden="true" />
                      <span>Hydrocarbon Gas (% LEL)</span>
                    </div>
                    <div className="text-[#68686F] mt-0.5">
                      Warn: 20% LEL · Exclusion: &gt;40% LEL
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-[#18181B]">
                    44-58% LEL
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-[#18181B] flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                      <span>Radiant Thermal Flux (deg C)</span>
                    </div>
                    <div className="text-[#68686F] mt-0.5">
                      Warn: 55 deg C · Critical: &gt;85 deg C
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-[#18181B]">
                    78.4 deg C
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-[#18181B] flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" aria-hidden="true" />
                      <span>Particulate Smoke (ppm)</span>
                    </div>
                    <div className="text-[#68686F] mt-0.5">
                      Obscuration limit: &gt;100 ppm
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-[#18181B]">
                    148 ppm
                  </span>
                </div>
              </div>
            </Card>

            {/* Tabbed Digital Twin Registry */}
            <Card
              aria-label="Digital twin entity registry"
              className="p-5 space-y-4"
            >
              <div
                role="tablist"
                aria-label="Twin entity categories"
                className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE]"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedAssetTab === "assets"}
                  onClick={() => setSelectedAssetTab("assets")}
                  className={`py-1.5 h-8 rounded-lg text-xs font-medium transition-colors ${
                    selectedAssetTab === "assets"
                      ? "bg-white text-[#18181B] shadow-xs border border-[#E2E2DE]"
                      : "text-[#68686F] hover:text-[#18181B]"
                  }`}
                >
                  Assets ({assets.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedAssetTab === "hazards"}
                  onClick={() => setSelectedAssetTab("hazards")}
                  className={`py-1.5 h-8 rounded-lg text-xs font-medium transition-colors ${
                    selectedAssetTab === "hazards"
                      ? "bg-white text-[#18181B] shadow-xs border border-[#E2E2DE]"
                      : "text-[#68686F] hover:text-[#18181B]"
                  }`}
                >
                  Hazards ({replayAdjustedHazards.filter((h) => h.active).length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedAssetTab === "sensors"}
                  onClick={() => setSelectedAssetTab("sensors")}
                  className={`py-1.5 h-8 rounded-lg text-xs font-medium transition-colors ${
                    selectedAssetTab === "sensors"
                      ? "bg-white text-[#18181B] shadow-xs border border-[#E2E2DE]"
                      : "text-[#68686F] hover:text-[#18181B]"
                  }`}
                >
                  Sensors ({sensors.length})
                </button>
              </div>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {selectedAssetTab === "assets" &&
                  assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-semibold text-[#18181B]">
                          {asset.code} · {asset.name}
                        </span>
                        <RiskBadge level={asset.riskStatus} />
                      </div>
                      <p className="text-[#52525B]">{asset.description}</p>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#68686F] pt-1">
                        <span>{asset.capacityOrSpec}</span>
                        <span>Workers: {asset.workersPresent}</span>
                      </div>
                    </div>
                  ))}

                {selectedAssetTab === "hazards" &&
                  replayAdjustedHazards.map((hz) => (
                    <div
                      key={hz.id}
                      className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#18181B]">
                          {hz.name}
                        </span>
                        <RiskBadge level={hz.severity} />
                      </div>
                      <p className="text-[#52525B]">{hz.description}</p>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#68686F]">
                        <span>Radius: {hz.radius} m</span>
                        <span>
                          <Badge
                            variant={hz.active ? "critical" : "neutral"}
                            dot
                          >
                            {hz.active ? "Active" : "Standby"}
                          </Badge>
                        </span>
                      </div>
                    </div>
                  ))}

                {selectedAssetTab === "sensors" &&
                  sensors.map((sn) => (
                    <div
                      key={sn.id}
                      className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-semibold text-[#18181B]">
                          {sn.id} · {sn.name}
                        </span>
                        <SensorStatusBadge status={sn.status} />
                      </div>
                      <div className="flex items-center justify-between text-[#52525B] font-mono pt-1">
                        <span>{sn.location}</span>
                        <strong className="text-[#18181B]">
                          {sn.value} {sn.unit}
                        </strong>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="pt-2 border-t border-[#EFEFEA]">
                <Link
                  href="/evacuation"
                  className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 py-2.5 rounded-xl btn-embossed text-xs font-medium"
                >
                  <Compass className="w-4 h-4" aria-hidden="true" />
                  <span>Open Adaptive Evacuation</span>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </UIStateWrapper>
    </div>
  );
}
