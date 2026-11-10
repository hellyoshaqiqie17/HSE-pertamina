"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  MapPin,
  Radio,
  RotateCcw,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEvora } from "@/lib/evora-context";
import { UIStateWrapper } from "@/components/shared/ui-state-wrapper";
import {
  DEFAULT_MAP_LAYERS,
  FacilitySchematicMap,
  MapLayerVisibility,
} from "@/components/shared/facility-schematic-map";
import {
  RiskBadge,
  RouteStatusBadge,
} from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OverviewPage() {
  const router = useRouter();
  const {
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    currentFacility,
    assets,
    sensors,
    hazards,
    routes,
    workers,
    alerts,
    timelineEvents,
    acknowledgeAlert,
    triggerHazardExpansion,
    resetDemoState,
    hazardExpansionStep,
    lastUpdatedTimestamp,
    scoringConfig,
  } = useEvora();

  const [mapLayers, setMapLayers] =
    useState<MapLayerVisibility>(DEFAULT_MAP_LAYERS);
  const [focusPoint, setFocusPoint] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);
  const [selectedTrendType, setSelectedTrendType] = useState<
    "gas" | "temperature" | "smoke"
  >("gas");

  const handleToggleLayer = (key: keyof MapLayerVisibility) => {
    setMapLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // KPI computations matching EVORA_Web_Mockup_Development_Brief.md Section 5 Page 1
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const onlineSensors = sensors.filter((s) => s.status !== "offline");
  const affectedWorkersCount = workers.filter(
    (w) => w.status === "affected"
  ).length;
  const recommendedRoute =
    routes.find((r) => r.status === "recommended") ?? routes[0];

  // Representative sensors for compact temperature, gas, and smoke charts
  const gasSensor =
    sensors.find((s) => s.type === "gas" && s.status === "critical") ??
    sensors.find((s) => s.type === "gas") ??
    sensors[0];
  const tempSensor =
    sensors.find((s) => s.type === "temperature") ?? sensors[0];
  const smokeSensor =
    sensors.find((s) => s.type === "smoke") ?? tempSensor;

  const activeTrendSensor =
    selectedTrendType === "gas"
      ? gasSensor
      : selectedTrendType === "temperature"
      ? tempSensor
      : smokeSensor;

  return (
    <UIStateWrapper pageTitle="Emergency Command Center">
      <div className="space-y-5">
        {/* ================================================================
            PAGE HEADER & FACILITY STATUS BANNER (EVORA Brief Section 5.1)
            ================================================================ */}
        <Card>
          <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level={currentFacility.overallRisk} />
                <Badge variant="neutral">
                  {currentFacility.statusBannerText}
                </Badge>
                <span className="text-xs font-mono text-[#71717A] inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Updated {lastUpdatedTimestamp}</span>
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-[#18181B]">
                Emergency Command Center
              </h1>
              <p className="text-sm text-[#52525B]">
                Operational safety overview for{" "}
                <strong className="text-[#18181B] font-semibold">
                  {currentFacility.name} ({currentFacility.code})
                </strong>{" "}
                integrating IoT multi-hazard telemetry, Digital Twin spatial
                modeling, and Hybrid Multi-Agent evacuation routing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] bg-[#F7F7F4] border border-[#E2E2DE] text-xs font-medium text-[#18181B]">
                <label htmlFor="overview-facility-select" className="text-[#52525B]">
                  Facility:
                </label>
                <select
                  id="overview-facility-select"
                  value={selectedFacilityId}
                  onChange={(e) => {
                    setSelectedFacilityId(e.target.value);
                    setFocusPoint(null);
                  }}
                  className="bg-transparent font-semibold text-[#18181B] focus:outline-none"
                >
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.code} · {fac.name.replace("Synthetic ", "")}
                    </option>
                  ))}
                </select>
              </div>

              {hazardExpansionStep === 0 ? (
                <Button
                  variant="outline"
                  onClick={triggerHazardExpansion}
                >
                  <Flame
                    className="w-3.5 h-3.5 text-[#C84B28]"
                    aria-hidden="true"
                  />
                  <span>Simulate Hazard Update</span>
                </Button>
              ) : (
                <Button variant="outline" onClick={resetDemoState}>
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Reset Baseline</span>
                </Button>
              )}

              <Button
                variant="embossed"
                onClick={() => router.push("/evacuation")}
              >
                <span>Run Evacuation Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ================================================================
            5 CORE KPI CARDS (EVORA Brief Section 5.1: Active Alerts, Sensors,
            Workers in Facility, Workers in Affected Zones, Evacuation Readiness)
            ================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* KPI 1: Active Alerts */}
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-[#52525B]">
                  Active Alerts
                </span>
                <span className="w-7 h-7 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE] flex items-center justify-center text-[#C84B28]">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-semibold font-mono tabular-nums text-[#18181B]">
                  {unacknowledgedAlerts.length}
                  <span className="text-sm font-normal text-[#71717A]">
                    /{alerts.length}
                  </span>
                </span>
                <Badge
                  variant={
                    unacknowledgedAlerts.length > 0 ? "critical" : "safe"
                  }
                  dot
                >
                  {unacknowledgedAlerts.length > 0 ? "Action Req" : "Cleared"}
                </Badge>
              </div>
              <p className="text-[11px] text-[#71717A] mt-2">
                Unacknowledged multi-hazard alarms
              </p>
            </CardContent>
          </Card>

          {/* KPI 2: Active Sensors / Total Sensors */}
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-[#52525B]">
                  Active IoT Sensors
                </span>
                <span className="w-7 h-7 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE] flex items-center justify-center text-[#18181B]">
                  <Radio className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-semibold font-mono tabular-nums text-[#18181B]">
                  {onlineSensors.length}
                  <span className="text-sm font-normal text-[#71717A]">
                    /{sensors.length}
                  </span>
                </span>
                <Badge variant="safe" dot>
                  Online
                </Badge>
              </div>
              <p className="text-[11px] text-[#71717A] mt-2">
                Temp, Gas (% LEL), Smoke, Fire, Wind
              </p>
            </CardContent>
          </Card>

          {/* KPI 3: Workers in Facility */}
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-[#52525B]">
                  Workers in Facility
                </span>
                <span className="w-7 h-7 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE] flex items-center justify-center text-[#18181B]">
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-semibold font-mono tabular-nums text-[#18181B]">
                  {currentFacility.totalWorkers}
                </span>
                <Badge variant="neutral">
                  {workers.length} Agent Groups
                </Badge>
              </div>
              <p className="text-[11px] text-[#71717A] mt-2">
                Tracked in Hybrid Multi-Agent model
              </p>
            </CardContent>
          </Card>

          {/* KPI 4: Workers in Affected Zones */}
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-[#52525B]">
                  Workers in Affected Zones
                </span>
                <span className="w-7 h-7 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE] flex items-center justify-center text-[#D97706]">
                  <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-semibold font-mono tabular-nums text-[#18181B]">
                  {affectedWorkersCount * 3}
                </span>
                <Badge
                  variant={affectedWorkersCount > 0 ? "warning" : "safe"}
                  dot
                >
                  {affectedWorkersCount} Groups Near Plume
                </Badge>
              </div>
              <p className="text-[11px] text-[#71717A] mt-2">
                Prioritized for adaptive rerouting
              </p>
            </CardContent>
          </Card>

          {/* KPI 5: Evacuation Readiness */}
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-[#52525B]">
                  Evacuation Readiness
                </span>
                <span className="w-7 h-7 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE] flex items-center justify-center text-[#16A34A]">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-semibold font-mono tabular-nums text-[#18181B]">
                  {currentFacility.evacuationReadinessPct}%
                </span>
                <Badge variant="safe" dot>
                  UPS 24V Ready
                </Badge>
              </div>
              <p className="text-[11px] text-[#71717A] mt-2">
                Dynamic signage &amp; backup power online
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ================================================================
            MAIN COMMAND CENTER WORKSPACE:
            LEFT 8 COLS (FACILITY MAP) + RIGHT 4 COLS (ACTIVE ALERTS & ROUTE DSS)
            ================================================================ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left 8 Columns: Simplified Facility Map with Sensor Markers, Hazard Zones, Assembly Points, and Route Status */}
          <div className="xl:col-span-8 space-y-4">
            <FacilitySchematicMap
              facilityName={currentFacility.name}
              facilityCode={currentFacility.code}
              windSpeedMps={currentFacility.windSpeedMps}
              windDirectionDeg={currentFacility.windDirectionDeg}
              windDirectionLabel={currentFacility.windDirectionLabel}
              assets={assets}
              sensors={sensors}
              hazards={hazards}
              routes={routes}
              workers={workers}
              layers={mapLayers}
              onToggleLayer={handleToggleLayer}
              showLayerToolbar={true}
              showViewModeToggle={true}
              selectedRouteId={recommendedRoute?.id ?? null}
              onSelectRoute={() => router.push("/evacuation")}
              focusPoint={focusPoint}
            />
          </div>

          {/* Right 4 Columns: Active Alerts Panel + Adaptive Route & Dynamic Signage Summary */}
          <div className="xl:col-span-4 space-y-4">
            {/* Active Alerts Ordered by Severity & Time */}
            <Card>
              <CardHeader className="pb-3 border-b border-[#ECECE8] flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Safety Alerts</CardTitle>
                  <CardDescription>
                    Click an alert to focus location on depot schematic
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    unacknowledgedAlerts.length > 0 ? "critical" : "safe"
                  }
                  dot
                >
                  {unacknowledgedAlerts.length} Open
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {alerts.map((alert) => {
                  const isFocused =
                    focusPoint?.x === alert.targetX &&
                    focusPoint?.y === alert.targetY;
                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isFocused
                          ? "bg-[#F7F7F4] border-[#18181B]"
                          : "bg-white border-[#E2E2DE] hover:border-[#D4D4CE]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setFocusPoint({
                              x: alert.targetX,
                              y: alert.targetY,
                              label: alert.location,
                            })
                          }
                          className="text-left group flex-1"
                        >
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <RiskBadge level={alert.severity} />
                            <span className="text-[11px] font-mono text-[#71717A]">
                              {alert.timestamp}
                            </span>
                          </div>
                          <h3 className="text-xs font-semibold text-[#18181B] group-hover:underline">
                            {alert.title}
                          </h3>
                        </button>
                      </div>

                      <p className="text-xs text-[#52525B] leading-relaxed mb-2.5">
                        {alert.description}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#ECECE8]">
                        <button
                          type="button"
                          onClick={() =>
                            setFocusPoint({
                              x: alert.targetX,
                              y: alert.targetY,
                              label: alert.location,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#18181B] hover:underline"
                        >
                          <MapPin className="w-3 h-3 text-[#C84B28]" aria-hidden="true" />
                          <span>{alert.location}</span>
                        </button>

                        {alert.acknowledged ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#15803D]">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Acknowledged</span>
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Adaptive Route & Field Dynamic Signage Status Card */}
            {recommendedRoute && (
              <Card>
                <CardHeader className="pb-3 border-b border-[#ECECE8] flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Active Evacuation Guidance</CardTitle>
                    <CardDescription>
                      Dynamic signage node {recommendedRoute.signageNodeId} (UPS
                      24V Backup)
                    </CardDescription>
                  </div>
                  <RouteStatusBadge status={recommendedRoute.status} />
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-mono text-[#52525B]">
                        RECOMMENDED CORRIDOR
                      </div>
                      <div className="text-sm font-semibold text-[#18181B] mt-0.5">
                        {recommendedRoute.name}
                      </div>
                      <div className="text-xs text-[#52525B] mt-0.5">
                        Destination: {recommendedRoute.destinationName}
                      </div>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <div className="text-lg font-bold text-[#18181B]">
                        {recommendedRoute.riskScore}
                        <span className="text-xs font-normal text-[#71717A]">
                          /100
                        </span>
                      </div>
                      <div className="text-[10px] text-[#52525B]">
                        Limit &lt;= {scoringConfig.riskThreshold}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                    <div className="p-2 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE]">
                      <div className="text-[10px] text-[#71717A]">DIST</div>
                      <div className="font-semibold text-[#18181B] mt-0.5">
                        {recommendedRoute.distanceMeters}m
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE]">
                      <div className="text-[10px] text-[#71717A]">EXPOSURE</div>
                      <div className="font-semibold text-[#18181B] mt-0.5">
                        {recommendedRoute.hazardExposure}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE]">
                      <div className="text-[10px] text-[#71717A]">DENSITY</div>
                      <div className="font-semibold text-[#18181B] mt-0.5">
                        {recommendedRoute.densityScore}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE]">
                      <div className="text-[10px] text-[#71717A]">ACCESS</div>
                      <div className="font-semibold text-[#15803D] mt-0.5">
                        OPEN
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Link
                      href="/digital-twin"
                      className="text-xs font-medium text-[#52525B] hover:text-[#18181B] underline"
                    >
                      Open Digital Twin Layers
                    </Link>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => router.push("/evacuation")}
                    >
                      <span>Compare All Routes</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ================================================================
            BOTTOM ROW: COMPACT MULTI-HAZARD SENSOR TRENDS (7 COLS) +
            RECENT EVENT & DECISION TIMELINE (5 COLS) (EVORA Brief Section 5.1)
            ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Multi-Hazard Sensor Trends (Gas % LEL, Temperature deg C, Smoke ppm) */}
          <Card className="lg:col-span-7 flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-[#ECECE8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Multi-Hazard IoT Sensor Trends</CardTitle>
                <CardDescription>
                  Simulated 30-minute telemetry feed informing the Digital Twin
                  hazard model
                </CardDescription>
              </div>

              <div
                role="tablist"
                aria-label="Select sensor telemetry stream"
                className="inline-flex rounded-[10px] bg-[#F1F1EE] p-1 border border-[#E2E2DE]/60"
              >
                {(
                  [
                    {
                      key: "gas",
                      label: `Gas (${gasSensor?.value ?? 44.2}% LEL)`,
                    },
                    {
                      key: "temperature",
                      label: `Temp (${tempSensor?.value ?? 78.4}°C)`,
                    },
                    {
                      key: "smoke",
                      label: `Smoke (${smokeSensor?.value ?? 148} ppm)`,
                    },
                  ] as const
                ).map((tab) => {
                  const active = selectedTrendType === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedTrendType(tab.key)}
                      className={`px-3 py-1 rounded-[8px] text-xs font-medium transition-all ${
                        active
                          ? "bg-white text-[#18181B] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                          : "text-[#52525B] hover:text-[#18181B]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {activeTrendSensor && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-mono font-semibold text-[#18181B]">
                        {activeTrendSensor.id}
                      </span>{" "}
                      ·{" "}
                      <span className="font-medium text-[#18181B]">
                        {activeTrendSensor.name}
                      </span>{" "}
                      <span className="text-[#52525B]">
                        ({activeTrendSensor.location})
                      </span>
                    </div>
                    <div className="font-mono text-[#52525B]">
                      Current:{" "}
                      <strong className="text-[#18181B]">
                        {activeTrendSensor.value} {activeTrendSensor.unit}
                      </strong>{" "}
                      | Warning: {activeTrendSensor.warningThreshold}{" "}
                      {activeTrendSensor.unit} | Critical:{" "}
                      {activeTrendSensor.criticalThreshold}{" "}
                      {activeTrendSensor.unit}
                    </div>
                  </div>

                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activeTrendSensor.history}>
                        <defs>
                          <linearGradient
                            id="overviewSensorFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#C84B28"
                              stopOpacity={0.22}
                            />
                            <stop
                              offset="95%"
                              stopColor="#C84B28"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#ECECE8"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 11, fill: "#52525B" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#52525B" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip />
                        <ReferenceLine
                          y={activeTrendSensor.warningThreshold}
                          stroke="#D97706"
                          strokeDasharray="4 4"
                        />
                        <ReferenceLine
                          y={activeTrendSensor.criticalThreshold}
                          stroke="#C84B28"
                          strokeDasharray="4 4"
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name={`${activeTrendSensor.name} (${activeTrendSensor.unit})`}
                          stroke="#C84B28"
                          strokeWidth={2}
                          fill="url(#overviewSensorFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Event & Decision Timeline */}
          <Card className="lg:col-span-5 flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-[#ECECE8] flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Event &amp; Decision Timeline</CardTitle>
                <CardDescription>
                  Automated IoT triggers, route reassessments, and operator
                  actions
                </CardDescription>
              </div>
              <Link
                href="/incidents"
                className="text-xs font-medium text-[#52525B] hover:text-[#18181B] underline"
              >
                Full Log
              </Link>
            </CardHeader>

            <CardContent className="p-4">
              <ol className="space-y-3">
                {timelineEvents.slice(0, 5).map((ev) => {
                  const dotColor =
                    ev.category === "evacuation" || ev.category === "sensor"
                      ? "bg-[#C84B28]"
                      : ev.category === "simulation" || ev.category === "twin"
                      ? "bg-[#D97706]"
                      : "bg-[#16A34A]";
                  return (
                    <li
                      key={ev.id}
                      className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] flex items-start gap-3"
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#18181B]">
                            {ev.title}
                          </span>
                          <span className="text-[11px] font-mono text-[#71717A]">
                            {ev.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-[#52525B] mt-1 leading-relaxed">
                          {ev.detail}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </UIStateWrapper>
  );
}
