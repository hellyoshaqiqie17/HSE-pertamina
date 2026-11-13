"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bomb,
  Building,
  CheckCircle2,
  Clock,
  Compass,
  DoorOpen,
  Droplets,
  Eye,
  Flame,
  Layers,
  MapPin,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wind,
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
    stationaryPosts,
    aiExplosionPrediction,
    isDelugeActive,
    toggleDelugeSystem,
    triggerSideBInspectionScenario,
    isSideBScenarioActive,
    timeToFailureCountdown,
    currentRoleLevel,
    setCurrentRoleLevel,
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
            PAGE HEADER & FACILITY STATUS BANNER (C:/ti & C:/pkm clean hierarchy)
            ================================================================ */}
        <Card className="border-[#E2E8F0]">
          <CardContent className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  Emergency Command Center
                </h1>
                <RiskBadge level={currentFacility.overallRisk} />
              </div>
              <p className="text-sm text-[#64748B] max-w-3xl leading-relaxed">
                Pusat komando dan pemantauan keselamatan operasional{" "}
                <strong className="text-[#0F172A] font-semibold">
                  {currentFacility.name} ({currentFacility.code})
                </strong>{" "}
                mengintegrasikan telemetri multi-hazard IoT, pemodelan spasial Digital Twin, dan rute evakuasi cerdas Hybrid Multi-Agent.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-[#64748B] font-mono">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
                  <span>Updated {lastUpdatedTimestamp}</span>
                </span>
                <span className="text-[#CBD5E1]">|</span>
                <span>{currentFacility.statusBannerText}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A]">
                <label htmlFor="overview-facility-select" className="text-[#64748B]">
                  Fasilitas:
                </label>
                <select
                  id="overview-facility-select"
                  value={selectedFacilityId}
                  onChange={(e) => {
                    setSelectedFacilityId(e.target.value);
                    setFocusPoint(null);
                  }}
                  className="bg-transparent font-semibold text-[#0F172A] focus:outline-none cursor-pointer"
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
                  className="font-medium"
                >
                  <Flame
                    className="w-3.5 h-3.5 text-red-600"
                    aria-hidden="true"
                  />
                  <span>Simulasi Plume Bahaya</span>
                </Button>
              ) : (
                <Button variant="outline" onClick={resetDemoState} className="font-medium">
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Reset Baseline</span>
                </Button>
              )}

              <Button
                variant="primary"
                onClick={() => router.push("/evacuation")}
                className="font-semibold"
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
          <div className={`bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center justify-between shadow-card ${
            unacknowledgedAlerts.length > 0 ? "border-l-4 border-l-red-600" : ""
          }`}>
            <div>
              <span className="text-xs text-[#64748B] font-medium">Peringatan Aktif</span>
              <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1 tabular-nums">
                {unacknowledgedAlerts.length}
                <span className="text-sm font-normal text-[#94A3B8]">/{alerts.length}</span>
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                {unacknowledgedAlerts.length > 0 ? "Perlu Konfirmasi HSE" : "Semua Terkendali"}
              </div>
            </div>
            <div className={`h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0 ${
              unacknowledgedAlerts.length > 0 ? "bg-red-50 text-red-600" : "bg-[#F8FAFC] text-[#94A3B8]"
            }`}>
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* KPI 2: Active Sensors */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center justify-between shadow-card">
            <div>
              <span className="text-xs text-[#64748B] font-medium">Sensor Online</span>
              <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1 tabular-nums">
                {onlineSensors.length}
                <span className="text-sm font-normal text-[#94A3B8]">/{sensors.length}</span>
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                Gas, Suhu, Smoke, IR, Wind
              </div>
            </div>
            <div className="h-10 w-10 rounded-[10px] flex items-center justify-center bg-[#EEF2FF] text-[#4B6BFB] shrink-0">
              <Radio className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* KPI 3: Workers in Facility */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center justify-between shadow-card">
            <div>
              <span className="text-xs text-[#64748B] font-medium">Personel Depo</span>
              <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1 tabular-nums">
                {currentFacility.totalWorkers}
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                42 Agen Multi-Agent Tracked
              </div>
            </div>
            <div className="h-10 w-10 rounded-[10px] flex items-center justify-center bg-[#EEF2FF] text-[#4B6BFB] shrink-0">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* KPI 4: Workers in Affected Zones */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center justify-between shadow-card">
            <div>
              <span className="text-xs text-[#64748B] font-medium">Dekat Plume</span>
              <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1 tabular-nums">
                {affectedWorkersCount * 3}
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                {affectedWorkersCount} Grup Di-Reroute Otomatis
              </div>
            </div>
            <div className={`h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0 ${
              affectedWorkersCount > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }`}>
              <Activity className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* KPI 5: Evacuation Readiness */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center justify-between shadow-card">
            <div>
              <span className="text-xs text-[#64748B] font-medium">Kesiapan Rambu</span>
              <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1 tabular-nums">
                {currentFacility.evacuationReadinessPct}%
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                UPS 24V Rambu VMS Aktif
              </div>
            </div>
            <div className="h-10 w-10 rounded-[10px] flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
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
                          ? "bg-[#EEF2FF] border-[#4B6BFB] shadow-sm"
                          : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]"
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
            AI EXPLOSION RISK PREDICTOR (BLEVE & VCE BLAST OVERPRESSURE)
            Matching C:/ti & C:/pkm light engineering card + alert system
            ================================================================ */}
        <Card className="border-[#E2E8F0] overflow-hidden">
          <CardHeader className="bg-white border-b border-[#E2E8F0] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-red-50 text-red-700 border border-red-200">
                  <Flame className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
                  <span>AI Explosion Risk Engine</span>
                </span>
                <span className="text-xs text-[#64748B] font-mono">
                  Target: {aiExplosionPrediction.targetAssetName.replace(/\s*\([^)]*\)$/, "")} · {aiExplosionPrediction.tankProduct}
                </span>
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
                Prediksi Potensi Ledakan Kilang &amp; BLEVE (Vapor Cloud Explosion)
              </CardTitle>
              <CardDescription className="text-[#64748B] text-xs sm:text-sm max-w-3xl">
                Analisis termodinamika bejana bertekanan, pemodelan gelombang kejut overpressure, dan estimasi waktu kritis menuju kegagalan cangkang (<em>Time-to-Failure</em>).
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className={`border rounded-[10px] px-4 py-2.5 text-right font-mono min-w-[180px] ${
                isDelugeActive
                  ? "bg-emerald-50 border-emerald-200"
                  : timeToFailureCountdown < 300
                  ? "bg-red-50 border-red-200"
                  : "bg-[#F8FAFC] border-[#E2E8F0]"
              }`}>
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-sans font-semibold">
                  Hitung Mundur Kegagalan
                </div>
                <div className={`text-xl font-bold mt-0.5 tabular-nums ${
                  isDelugeActive ? "text-emerald-700" : timeToFailureCountdown < 300 ? "text-red-700" : "text-amber-700"
                }`}>
                  {isDelugeActive ? (
                    "STABIL (DELUGE)"
                  ) : (
                    `${Math.floor(timeToFailureCountdown / 60)}m ${String(timeToFailureCountdown % 60).padStart(2, "0")}s`
                  )}
                </div>
                <div className="text-[10px] text-[#64748B]">
                  {isDelugeActive ? "Laju kenaikan tekanan terhenti" : "BLEVE Rupture Threat"}
                </div>
              </div>

              <Button
                type="button"
                onClick={toggleDelugeSystem}
                className={`h-12 px-4 rounded-[10px] font-semibold text-xs transition-colors cursor-pointer ${
                  isDelugeActive
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-[#4B6BFB] hover:bg-[#3B5BEB] text-white"
                }`}
              >
                <Droplets className="w-4 h-4 mr-1.5" aria-hidden="true" />
                <span>
                  {isDelugeActive ? "Matikan Deluge Spray" : "Aktifkan Deluge Spray T-102"}
                </span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-5">
            {/* Top Telemetry & Probability Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#FAFBFC] border border-[#E2E8F0]">
                <div className="text-xs text-[#64748B] font-medium">Probabilitas Ledakan BLEVE</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl font-bold font-mono tabular-nums ${
                    aiExplosionPrediction.probabilityPct > 50 ? "text-red-600" : "text-emerald-600"
                  }`}>
                    {aiExplosionPrediction.probabilityPct}%
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    aiExplosionPrediction.probabilityPct > 50
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    {aiExplosionPrediction.threatLevel}
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] mt-1">
                  {isDelugeActive ? "Ditekan oleh semprotan pendingin air" : "Radiasi panas dari Manifold PIPE-01"}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFBFC] border border-[#E2E8F0]">
                <div className="text-xs text-[#64748B] font-medium">Suhu Cangkang Tangki</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-[#0F172A] tabular-nums">
                    {aiExplosionPrediction.telemetryFactors.shellTemperatureC}°C
                  </span>
                  <span className="text-xs text-red-600 font-semibold">
                    Ambang &gt;65.0°C
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] mt-1">
                  Sensor IR Bund: FIR-01 (68 IR index)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFBFC] border border-[#E2E8F0]">
                <div className="text-xs text-[#64748B] font-medium">Tekanan Uap Dalam Tangki</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-[#0F172A] tabular-nums">
                    {aiExplosionPrediction.telemetryFactors.internalPressureBar} bar
                  </span>
                  <span className="text-xs text-amber-600 font-semibold">
                    Kritis &gt;3.0 bar
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] mt-1">
                  Relief valve venting: {aiExplosionPrediction.telemetryFactors.reliefValveVentingKgS} kg/s
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFBFC] border border-[#E2E8F0]">
                <div className="text-xs text-[#64748B] font-medium">Stress Akustik Material</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-[#0F172A] tabular-nums">
                    {aiExplosionPrediction.telemetryFactors.acousticMicroStressDb} dB
                  </span>
                  <span className="text-xs text-[#64748B] font-semibold">
                    Micro-crack sensor
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] mt-1">
                  Emisi akustik cangkang baja T-102
                </div>
              </div>
            </div>

            {/* Blast Wave Radii & Safety Perimeter Diagram (clean light engineering cards) */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#FAFBFC] border border-[#E2E8F0] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" aria-hidden="true" />
                  <span className="font-semibold text-sm text-[#0F172A]">
                    Radius Gelombang Kejut Ledakan (Blast Wave Overpressure Radii)
                  </span>
                </div>
                <span className="text-xs text-[#64748B] font-mono">
                  Standar API 581 &amp; NFPA 30 Damage Estimation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-[10px] bg-red-50/80 border border-red-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-800">ZONA LETHAL (&gt;10 psi)</span>
                    <span className="text-xs font-mono font-bold text-red-700">
                      {aiExplosionPrediction.blastWaveRadii.lethalOverpressureMeters}m
                    </span>
                  </div>
                  <p className="text-[11px] text-red-900/80 leading-relaxed">
                    100% fatalitas bagi personel di luar ruangan; kehancuran total fasilitas dan pipa. Evakuasi seketika tanpa jeda.
                  </p>
                </div>

                <div className="p-3.5 rounded-[10px] bg-amber-50/80 border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">KERUSAKAN STRUKTURAL (&gt;3 psi)</span>
                    <span className="text-xs font-mono font-bold text-amber-700">
                      {aiExplosionPrediction.blastWaveRadii.structuralDamageMeters}m
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 leading-relaxed">
                    Kerusakan tangki tetangga (T-101 &amp; T-103), robohnya rak pipa manifold, dan pecahan proyektil logam.
                  </p>
                </div>

                <div className="p-3.5 rounded-[10px] bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">BATAS AMAN EVAKUASI (&gt;1 psi)</span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {aiExplosionPrediction.blastWaveRadii.glassBreakageMeters}m
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                    Titik Kumpul AP-ALPHA (82, 132) dan AP-BRAVO (530, 472) berada di luar batas ini (&gt;150m) sehingga aman bagi personel.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ================================================================
            POS STASIONER EVAKUASI MATRIX (8 POS SELURUH LEVEL TBBM)
            ================================================================ */}
        <Card className="border-[#E2E8F0]">
          <CardHeader className="p-5 sm:p-6 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#4B6BFB]" aria-hidden="true" />
                <CardTitle className="text-lg sm:text-xl font-bold text-[#0F172A]">
                  Matriks Evakuasi Pos Stasioner Seluruh Level Depo (8 Pos Stasioner)
                </CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm text-[#64748B]">
                Instruksi evakuasi terdistribusi per pos operasional: mencakup seluruh level mulai dari operator gantry hingga pos jaga gerbang.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={triggerSideBInspectionScenario}
                className={`rounded-xl text-xs font-semibold ${
                  isSideBScenarioActive ? "border-amber-500 bg-amber-50 text-amber-900" : ""
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mr-1" aria-hidden="true" />
                <span>Simulasi Insiden Side B (Sidak Terancam)</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={() => router.push("/simulation")}
                className="rounded-xl text-xs font-semibold"
              >
                <span>Buka Simulasi Visual</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="p-3.5 pl-6">Pos Stasioner</th>
                    <th className="p-3.5">Zona</th>
                    <th className="p-3.5">Personel & Level</th>
                    <th className="p-3.5">Status Risiko</th>
                    <th className="p-3.5">Koridor Evakuasi</th>
                    <th className="p-3.5">Titik Kumpul</th>
                    <th className="p-3.5 pr-6">Instruksi Level & Akses Gerbang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stationaryPosts.map((post) => {
                    const isSideB = post.id === "POST-GANTRY-B";
                    const isHighlighted = isSideB && (currentRoleLevel === "level-2-inspector" || isSideBScenarioActive);

                    return (
                      <tr
                        key={post.id}
                        className={`transition-colors ${
                          isHighlighted
                            ? "bg-amber-50/70 hover:bg-amber-50"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="p-3.5 pl-6 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{post.name}</span>
                            {isSideB && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-mono font-bold">
                                SIDE B
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 font-normal">
                            {post.shortCode} · Estimasi {post.estimatedEscapeTimeSec}s
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-600 font-medium">
                          {post.zone}
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 font-mono">
                            {post.totalPersonnel} Orang
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {post.personnelLevelsPresent.map((lvl) => (
                              <span
                                key={lvl}
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                  lvl === "level-2-inspector"
                                    ? "bg-amber-200 text-amber-900"
                                    : lvl === "level-3-manager"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {lvl === "level-1-operator"
                                  ? "L1"
                                  : lvl === "level-2-inspector"
                                  ? "L2 (Sidak)"
                                  : lvl === "level-3-manager"
                                  ? "L3 (Mgr)"
                                  : "L4"}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <RiskBadge level={post.currentRisk} />
                        </td>

                        <td className="p-3.5 font-medium text-slate-800">
                          {post.evacuationCorridor}
                          <div className="text-[10px] text-slate-500 font-mono">
                            Jarak: {post.distanceMeters}m
                          </div>
                        </td>

                        <td className="p-3.5 font-bold font-mono text-slate-900">
                          {post.destinationAssembly}
                        </td>

                        <td className="p-3.5 pr-6 text-slate-700 leading-relaxed max-w-sm">
                          <div className="text-[11px]">
                            {currentRoleLevel === "level-2-inspector" && post.specialLevelGuidance["level-2-inspector"] ? (
                              <strong className="text-amber-900 block font-semibold mb-0.5">
                                [Panduan Sidak]: {post.specialLevelGuidance["level-2-inspector"]}
                              </strong>
                            ) : null}
                            <span>{post.specialLevelGuidance[currentRoleLevel] ?? post.specialLevelGuidance["level-1-operator"]}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] font-mono">
                            <span className="text-slate-500">Akses Gerbang:</span>
                            <span className={`font-bold ${
                              post.gateAccessStatus === "OPEN"
                                ? "text-emerald-600"
                                : post.gateAccessStatus === "RESTRICTED"
                                ? "text-amber-600"
                                : "text-blue-600"
                            }`}>
                              {post.gateAccessStatus}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

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
                          ? "bg-white text-[#0F172A] shadow-sm"
                          : "text-[#64748B] hover:text-[#0F172A]"
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