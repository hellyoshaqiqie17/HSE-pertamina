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
    sensors.find((s) => s.type === "temperature" && s.status === "warning") ??
    sensors.find((s) => s.type === "temperature") ??
    sensors[1];
  const smokeSensor =
    sensors.find((s) => s.type === "smoke" && s.status === "warning") ??
    sensors.find((s) => s.type === "smoke") ??
    sensors[2];

  const activeTrendSensor =
    selectedTrendType === "gas"
      ? gasSensor
      : selectedTrendType === "temperature"
      ? tempSensor
      : smokeSensor;

  return (
    <UIStateWrapper pageTitle="Emergency Command Center">
      <div className="space-y-6">
        {/* ================================================================
            PAGE HEADER & FACILITY STATUS BANNER (EVORA Brief Section 5.1)
            ================================================================ */}
        <Card className="border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level={currentFacility.overallRisk} />
                <Badge variant="neutral">
                  {currentFacility.statusBannerText}
                </Badge>
                <span className="text-xs font-mono text-slate-500 inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Updated {lastUpdatedTimestamp}</span>
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Emergency Command Center
              </h1>
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                Pusat komando dan pemantauan keselamatan operasional{" "}
                <strong className="text-slate-900 font-semibold">
                  {currentFacility.name} ({currentFacility.code})
                </strong>{" "}
                mengintegrasikan telemetri multi-hazard IoT, pemodelan spasial Digital Twin, dan rute evakuasi cerdas Hybrid Multi-Agent.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="inline-flex items-center gap-2 px-3 h-9 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                <label htmlFor="overview-facility-select" className="text-slate-500">
                  Fasilitas:
                </label>
                <select
                  id="overview-facility-select"
                  value={selectedFacilityId}
                  onChange={(e) => {
                    setSelectedFacilityId(e.target.value);
                    setFocusPoint(null);
                  }}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
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
                  className="rounded-xl font-medium"
                >
                  <Flame
                    className="w-3.5 h-3.5 text-rose-600"
                    aria-hidden="true"
                  />
                  <span>Simulasi Plume Bahaya</span>
                </Button>
              ) : (
                <Button variant="outline" onClick={resetDemoState} className="rounded-xl font-medium">
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Reset Baseline</span>
                </Button>
              )}

              <Button
                variant="primary"
                onClick={() => router.push("/evacuation")}
                className="rounded-xl font-semibold"
              >
                <span>Analisis Evakuasi</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ================================================================
            5 CORE KPI CARDS (Matching C:/pkm & C:/ti .grid-kpis pattern)
            ================================================================ */}
        <div className="grid-kpis">
          {/* KPI 1: Active Alerts */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex items-center justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div>
              <span className="text-xs text-slate-500 font-medium">Peringatan Bahaya Aktif</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {unacknowledgedAlerts.length}
                <span className="text-sm font-normal text-slate-400">/{alerts.length}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {unacknowledgedAlerts.length > 0 ? "Perlu Konfirmasi HSE" : "Semua Terkendali"}
              </div>
            </div>
            <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
              unacknowledgedAlerts.length > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400"
            }`}>
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* KPI 2: Active Sensors */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex items-center justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div>
              <span className="text-xs text-slate-500 font-medium">Sensor IoT Online</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {onlineSensors.length}
                <span className="text-sm font-normal text-slate-400">/{sensors.length}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Gas, Suhu, Smoke, IR, Wind
              </div>
            </div>
            <div className="h-11 w-11 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
              <Radio className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* KPI 3: Workers in Facility */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex items-center justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div>
              <span className="text-xs text-slate-500 font-medium">Personel di Depo</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {currentFacility.totalWorkers}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                42 Agen Multi-Agent Tracked
              </div>
            </div>
            <div className="h-11 w-11 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 shrink-0">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* KPI 4: Workers in Affected Zones */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex items-center justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div>
              <span className="text-xs text-slate-500 font-medium">Personel Dekat Plume</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {affectedWorkersCount * 3}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {affectedWorkersCount} Grup Di-Reroute Otomatis
              </div>
            </div>
            <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
              affectedWorkersCount > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }`}>
              <Activity className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* KPI 5: Evacuation Readiness */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex items-center justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div>
              <span className="text-xs text-slate-500 font-medium">Kesiapan Rambu Evakuasi</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {currentFacility.evacuationReadinessPct}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                UPS 24V Rambu VMS Aktif
              </div>
            </div>
            <div className="h-11 w-11 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* ================================================================
            MAIN COMMAND CENTER WORKSPACE:
            LEFT 8 COLS (FACILITY MAP) + RIGHT 4 COLS (ACTIVE ALERTS & ROUTE DSS)
            ================================================================ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left 8 Columns: Facility Map Card */}
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
          <div className="xl:col-span-4 space-y-5">
            {/* Active Alerts Ordered by Severity & Time */}
            <Card className="border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Peringatan Keselamatan Aktif</CardTitle>
                  <CardDescription>
                    Klik untuk fokus lokasi pada skematik fasilitas
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    unacknowledgedAlerts.length > 0 ? "critical" : "safe"
                  }
                  dot
                >
                  {unacknowledgedAlerts.length} Terbuka
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
                          ? "bg-blue-50/70 border-blue-400 shadow-xs"
                          : "bg-white border-slate-200/90 hover:border-slate-300"
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
                            <span className="text-[11px] font-mono text-slate-500">
                              {alert.timestamp}
                            </span>
                          </div>
                          <h3 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {alert.title}
                          </h3>
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                        {alert.description}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() =>
                            setFocusPoint({
                              x: alert.targetX,
                              y: alert.targetY,
                              label: alert.location,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-700 hover:text-blue-600 transition-colors"
                        >
                          <MapPin className="w-3 h-3 text-rose-600" aria-hidden="true" />
                          <span>{alert.location}</span>
                        </button>

                        {alert.acknowledged ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Diakui</span>
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="rounded-lg text-xs font-semibold"
                          >
                            Konfirmasi
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
              <Card className="border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Panduan Rute Adaptif Terpilih</CardTitle>
                    <CardDescription>
                      Node rambu digital {recommendedRoute.signageNodeId} (UPS 24V Aktif)
                    </CardDescription>
                  </div>
                  <RouteStatusBadge status={recommendedRoute.status} />
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-mono font-bold text-blue-700">
                        KORIDOR DIREKOMENDASIKAN
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {recommendedRoute.name}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Tujuan: {recommendedRoute.destinationName}
                      </div>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <div className="text-lg font-bold text-slate-900">
                        {recommendedRoute.riskScore}
                        <span className="text-xs font-normal text-slate-500">
                          /100
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Batas &le; {scoringConfig.riskThreshold}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">JARAK</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {recommendedRoute.distanceMeters}m
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">PAPARAN</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {recommendedRoute.hazardExposure}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">DENSITAS</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {recommendedRoute.densityScore}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">AKSES</div>
                      <div className="font-bold text-emerald-600 mt-0.5">
                        OPEN
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Link
                      href="/digital-twin"
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 underline"
                    >
                      Buka Layer Digital Twin
                    </Link>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => router.push("/evacuation")}
                      className="rounded-xl font-semibold"
                    >
                      <span>Bandingkan Semua Rute</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Multi-Hazard Sensor Trends (Gas % LEL, Temperature deg C, Smoke ppm) */}
          <Card className="lg:col-span-7 flex flex-col justify-between border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Tren Telemetri Sensor IoT Multi-Hazard</CardTitle>
                <CardDescription>
                  Aliran telemetri 30-menit yang memperbarui model Digital Twin secara real-time
                </CardDescription>
              </div>

              <div
                role="tablist"
                aria-label="Select sensor telemetry stream"
                className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60"
              >
                {(
                  [
                    {
                      key: "gas",
                      label: `Gas (${gasSensor?.value ?? 44.2}% LEL)`,
                    },
                    {
                      key: "temperature",
                      label: `Suhu (${tempSensor?.value ?? 78.4}°C)`,
                    },
                    {
                      key: "smoke",
                      label: `Asap (${smokeSensor?.value ?? 148} ppm)`,
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
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
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
                      <span className="font-mono font-bold text-slate-900">
                        {activeTrendSensor.id}
                      </span>{" "}
                      ·{" "}
                      <span className="font-semibold text-slate-800">
                        {activeTrendSensor.name}
                      </span>{" "}
                      <span className="text-slate-500">
                        ({activeTrendSensor.location})
                      </span>
                    </div>
                    <div className="font-mono text-slate-600">
                      Nilai Saat Ini:{" "}
                      <strong className="text-slate-900 font-bold">
                        {activeTrendSensor.value} {activeTrendSensor.unit}
                      </strong>{" "}
                      | Warning: {activeTrendSensor.warningThreshold}{" "}
                      {activeTrendSensor.unit} | Critical:{" "}
                      {activeTrendSensor.criticalThreshold}{" "}
                      {activeTrendSensor.unit}
                    </div>
                  </div>

                  <div className="h-56 w-full">
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
                              stopColor="#2563EB"
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor="#2563EB"
                              stopOpacity={0.01}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#F1F5F9"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 11, fill: "#64748B" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#64748B" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip />
                        <ReferenceLine
                          y={activeTrendSensor.warningThreshold}
                          stroke="#F59E0B"
                          strokeDasharray="4 4"
                        />
                        <ReferenceLine
                          y={activeTrendSensor.criticalThreshold}
                          stroke="#EF4444"
                          strokeDasharray="4 4"
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name={`${activeTrendSensor.name} (${activeTrendSensor.unit})`}
                          stroke="#2563EB"
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
          <Card className="lg:col-span-5 flex flex-col justify-between border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Kronologi Kejadian &amp; Keputusan</CardTitle>
                <CardDescription>
                  Pemicu IoT otomatis, asesmen ulang rute, dan intervensi operator
                </CardDescription>
              </div>
              <Link
                href="/incidents"
                className="text-xs font-semibold text-slate-600 hover:text-blue-600 underline"
              >
                Log Lengkap
              </Link>
            </CardHeader>

            <CardContent className="p-4">
              <ol className="space-y-3">
                {timelineEvents.slice(0, 5).map((ev) => {
                  const dotColor =
                    ev.category === "evacuation" || ev.category === "sensor"
                      ? "bg-rose-500"
                      : ev.category === "simulation" || ev.category === "twin"
                      ? "bg-amber-500"
                      : "bg-emerald-500";
                  return (
                    <li
                      key={ev.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {ev.title}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {ev.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
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