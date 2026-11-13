"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Boxes,
  Building,
  Calculator,
  CheckCircle2,
  Droplets,
  Flame,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { useEvora } from "@/lib/evora-context";
import { RouteStatusBadge } from "@/components/shared/status-badge";
import { UIStateWrapper } from "@/components/shared/ui-state-wrapper";
import { FacilitySchematicMap } from "@/components/shared/facility-schematic-map";
import { SignagePreview } from "@/components/shared/signage-preview";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatSecondsToMinSec } from "@/lib/utils";

export default function AdaptiveEvacuationPage() {
  const {
    currentFacility,
    assets,
    sensors,
    hazards,
    routes,
    workers,
    scoringConfig,
    updateScoringConfig,
    triggerHazardExpansion,
    resetDemoState,
    recalculateRoutesNow,
    toggleRouteAccessibility,
    hazardExpansionStep,
    lastUpdatedTimestamp,
    stationaryPosts,
    aiExplosionPrediction,
    isDelugeActive,
    currentRoleLevel,
    isSideBScenarioActive,
    triggerSideBInspectionScenario,
  } = useEvora();

  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    routes[0]?.id ?? "RT-ALPHA-A"
  );
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [showScoringDrawer, setShowScoringDrawer] = useState<boolean>(false);

  const recommendedRoute =
    routes.find((r) => r.status === "recommended") ?? null;
  const activeDetailRoute =
    routes.find((r) => r.id === selectedRouteId) ??
    recommendedRoute ??
    routes[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Adaptive Evacuation
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1">
            Real-time corridor evaluation across distance, plume exposure, worker
            density, and physical gate accessibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={recalculateRoutesNow}
          >
            <Calculator className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />
            <span>Recalculate Score</span>
          </Button>

          <Button
            type="button"
            variant={showCompareModal ? "default" : "outline"}
            onClick={() => setShowCompareModal((v) => !v)}
            aria-expanded={showCompareModal}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{showCompareModal ? "Hide Matrix" : "Compare Corridors"}</span>
          </Button>

          <Link
            href="/digital-twin"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 py-2 text-xs font-medium rounded-xl bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <Boxes className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />
            <span>Digital Twin</span>
          </Link>
        </div>
      </div>

      <UIStateWrapper pageTitle="Adaptive Evacuation">
        {/* Minimalist Active Corridor Guidance Control Bar */}
        <Card
          aria-labelledby="guided-demo-heading"
          className="p-5 sm:p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={hazardExpansionStep === 0 ? "safe" : "critical"}
                  dot
                >
                  {hazardExpansionStep === 0
                    ? "Baseline Telemetry · Route A Active"
                    : "Plume Shift · Rerouted to Route B"}
                </Badge>
                <span className="text-xs font-mono text-[#64748B]">
                  Threshold &le; {scoringConfig.riskThreshold}/100
                </span>
              </div>

              <h2
                id="guided-demo-heading"
                className="text-base sm:text-lg font-semibold text-[#0F172A] tracking-tight"
              >
                {hazardExpansionStep === 0
                  ? "Route A (North-West Upwind Corridor) is Currently Recommended"
                  : "Route A Blocked by Westward Plume · Route B Promoted"}
              </h2>

              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {hazardExpansionStep === 0
                  ? "The 44.2% LEL vapor plume is confined to the East Central Manifold, blocking Route C (86/100). Route A maintains the lowest composite risk score (23/100)."
                  : "Westward vapor dispersion (58.0% LEL) crossed the North-West Service Road, raising Route A risk to 78/100 (above the 65/100 limit). EVORA promoted Route B (South Perimeter Bypass, 28/100) and updated field signage."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="embossed"
                size="lg"
                onClick={triggerHazardExpansion}
              >
                <Flame className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
                <span>
                  {hazardExpansionStep === 0
                    ? "Simulate Plume Shift Near Route A"
                    : "Escalate Plume Intensity"}
                </span>
              </Button>

              {hazardExpansionStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={resetDemoState}
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Restore Baseline</span>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Side-by-Side Route Comparison Matrix */}
        {showCompareModal && (
          <Card
            aria-labelledby="route-comparison-heading"
            className="p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#F1F5F9]">
              <div>
                <h2
                  id="route-comparison-heading"
                  className="text-sm sm:text-base font-semibold text-[#0F172A]"
                >
                  Candidate Corridor Comparison Matrix
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Comparing all candidate corridors against the configured maximum
                  risk threshold ({scoringConfig.riskThreshold}/100).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCompareModal(false)}
              >
                Close
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Corridor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Composite Score</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead>Plume Exposure</TableHead>
                  <TableHead>Worker Density</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Muster Point</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((rt) => (
                  <TableRow key={rt.id}>
                    <TableCell className="font-semibold text-[#0F172A]">
                      {rt.name}{" "}
                      <span className="font-mono text-[#64748B] font-normal">
                        ({rt.id})
                      </span>
                    </TableCell>
                    <TableCell>
                      <RouteStatusBadge status={rt.status} />
                    </TableCell>
                    <TableCell className="font-mono font-semibold tabular-nums">
                      {rt.riskScore}/100{" "}
                      <span className="text-[11px] font-normal text-[#64748B]">
                        (max {scoringConfig.riskThreshold})
                      </span>
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {rt.distanceMeters} m
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {formatSecondsToMinSec(rt.estimatedTimeSeconds)} (
                      {rt.estimatedTimeSeconds}s)
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {rt.hazardExposure}/100
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {rt.densityScore}/100
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={rt.accessible ? "safe" : "critical"}
                        dot
                      >
                        {rt.accessible ? "Clear" : "Obstructed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#475569]">
                      {rt.destinationName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Main Workspace: Evacuation Map (Left 7 cols) + Ranked Route Alternatives & Decision Breakdown (Right 5 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Map + Dynamic Signage Preview */}
          <div className="xl:col-span-7 space-y-6">
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
              selectedRouteId={activeDetailRoute?.id}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              showLayerToolbar={false}
              showViewModeToggle={true}
            />

            {/* Dynamic Field Signage Preview */}
            <SignagePreview
              routes={routes}
              lastUpdated={lastUpdatedTimestamp}
            />
          </div>

          {/* Right Column: Decision Summary, Ranked Candidates, and Route Score Breakdown */}
          <div className="xl:col-span-5 space-y-5">
            {/* Decision Summary Card */}
            <Card
              aria-labelledby="decision-summary-heading"
              className="p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#F1F5F9]">
                <div>
                  <span className="text-xs font-medium text-[#64748B] block">
                    Decision Output
                  </span>
                  <h2
                    id="decision-summary-heading"
                    className="text-sm sm:text-base font-semibold text-[#0F172A]"
                  >
                    Active Evacuation Recommendation
                  </h2>
                </div>
                <Badge variant="neutral" dot>
                  Live Formula
                </Badge>
              </div>

              {recommendedRoute ? (
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-medium text-[#475569]">
                      Primary Corridor · {recommendedRoute.id}
                    </span>
                    <RouteStatusBadge status="recommended" />
                  </div>
                  <div className="text-base font-semibold text-[#0F172A]">
                    {recommendedRoute.name}
                  </div>
                  <div className="text-xs text-[#475569]">
                    Origin: <strong className="text-[#0F172A]">{recommendedRoute.originZone}</strong>{" "}
                    · Muster:{" "}
                    <strong className="text-[#0F172A]">{recommendedRoute.destinationName}</strong>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed pt-1 border-t border-[#E2E8F0]">
                    {recommendedRoute.explanation}
                  </p>
                </div>
              ) : (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                >
                  <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
                    <span>No Safe Corridor Below Threshold</span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    All candidate corridors currently exceed the configured
                    maximum risk threshold ({scoringConfig.riskThreshold}/100)
                    or fail physical accessibility checks. Personnel must
                    shelter in the blast-resistant control building or follow
                    site warden dispatch.
                  </p>
                </div>
              )}

              {/* Configurable Threshold & Weights Drawer Toggle */}
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScoringDrawer((s) => !s)}
                  aria-expanded={showScoringDrawer}
                  className="w-full justify-between"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />
                    <span>
                      Threshold ({scoringConfig.riskThreshold}/100) &amp; Weights
                    </span>
                  </span>
                  <span className="font-mono text-[#64748B]">
                    {showScoringDrawer ? "Hide" : "Configure"}
                  </span>
                </Button>

                {showScoringDrawer && (
                  <div className="mt-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between font-medium text-[#0F172A] mb-1.5">
                        <label htmlFor="risk-threshold-slider">
                          Max Allowed Risk Threshold
                        </label>
                        <span className="font-mono font-semibold">
                          {scoringConfig.riskThreshold} / 100
                        </span>
                      </div>
                      <input
                        id="risk-threshold-slider"
                        type="range"
                        min={20}
                        max={90}
                        step={5}
                        value={scoringConfig.riskThreshold}
                        onChange={(e) =>
                          updateScoringConfig({
                            riskThreshold: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#0F172A]"
                      />
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Lower threshold to 20 to test the shelter-in-place safety fallback.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#E2E8F0]">
                      <div>
                        <label
                          htmlFor="weight-exposure"
                          className="block font-medium text-[#475569] mb-1"
                        >
                          Exposure Weight:{" "}
                          <strong className="font-mono text-[#0F172A]">
                            {Math.round(scoringConfig.exposureWeight * 100)}%
                          </strong>
                        </label>
                        <input
                          id="weight-exposure"
                          type="range"
                          min={0.1}
                          max={0.8}
                          step={0.05}
                          value={scoringConfig.exposureWeight}
                          onChange={(e) =>
                            updateScoringConfig({
                              exposureWeight: Number(e.target.value),
                            })
                          }
                          className="w-full accent-[#0F172A]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="weight-distance"
                          className="block font-medium text-[#475569] mb-1"
                        >
                          Distance Weight:{" "}
                          <strong className="font-mono text-[#0F172A]">
                            {Math.round(scoringConfig.distanceWeight * 100)}%
                          </strong>
                        </label>
                        <input
                          id="weight-distance"
                          type="range"
                          min={0.05}
                          max={0.6}
                          step={0.05}
                          value={scoringConfig.distanceWeight}
                          onChange={(e) =>
                            updateScoringConfig({
                              distanceWeight: Number(e.target.value),
                            })
                          }
                          className="w-full accent-[#0F172A]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Ranked Candidate Route Cards */}
            <Card
              aria-labelledby="candidate-routes-heading"
              className="p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h2
                  id="candidate-routes-heading"
                  className="text-sm sm:text-base font-semibold text-[#0F172A]"
                >
                  Candidate Evacuation Corridors
                </h2>
                <span className="text-xs font-mono text-[#64748B]">
                  Limit &le; {scoringConfig.riskThreshold}/100
                </span>
              </div>

              <div className="space-y-3.5">
                {routes.map((route) => {
                  const isSelected = activeDetailRoute?.id === route.id;
                  return (
                    <div
                      key={route.id}
                      className={`rounded-2xl border p-4 bg-white transition-all ${
                        isSelected
                          ? "border-[#4B6BFB] ring-1 ring-[#4B6BFB]/20 shadow-sm"
                          : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]">
                            {route.shortCode}
                          </span>
                          <h3 className="text-sm font-semibold text-[#0F172A]">
                            {route.name}
                          </h3>
                        </div>
                        <RouteStatusBadge status={route.status} />
                      </div>

                      {/* 4 Evaluation Criteria Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                        <div>
                          <div className="text-[11px] text-[#64748B]">
                            Distance
                          </div>
                          <div className="font-mono font-semibold tabular-nums text-[#0F172A] mt-0.5">
                            {route.distanceMeters} m{" "}
                            <span className="font-normal text-[#64748B]">
                              ({route.estimatedTimeSeconds}s)
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-[#64748B]">
                            Exposure
                          </div>
                          <div className="font-mono font-semibold tabular-nums text-[#0F172A] mt-0.5">
                            {route.hazardExposure}/100
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-[#64748B]">
                            Density
                          </div>
                          <div className="font-mono font-semibold tabular-nums text-[#0F172A] mt-0.5">
                            {route.densityScore}/100
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-[#64748B]">
                            Access
                          </div>
                          <div className="font-medium text-[#0F172A] mt-0.5 flex items-center gap-1">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                route.accessible
                                  ? "bg-emerald-500"
                                  : "bg-red-600"
                              }`}
                              aria-hidden="true"
                            />
                            <span>{route.accessible ? "Clear" : "Blocked"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Composite Risk Bar */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#64748B]">
                            Composite Risk Score
                          </span>
                          <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
                            {route.riskScore} / 100
                          </span>
                        </div>
                        <Progress
                          value={route.riskScore}
                          indicatorClassName={
                            route.status === "blocked"
                              ? "bg-red-600"
                              : "bg-[#0F172A]"
                          }
                        />
                      </div>

                      <p className="text-xs text-[#475569] leading-relaxed mb-3">
                        {route.explanation}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#F1F5F9]">
                        <Button
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedRouteId(route.id)}
                          aria-pressed={isSelected}
                        >
                          {isSelected ? "Inspecting Score" : "Inspect Breakdown"}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRouteAccessibility(route.id)}
                        >
                          {route.accessible
                            ? "Simulate Gate Block"
                            : "Restore Gate Access"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Selected Route Factor Contribution Panel */}
            {activeDetailRoute && (
              <Card
                aria-labelledby="route-detail-breakdown-heading"
                className="p-5 sm:p-6 space-y-3.5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                  <h2
                    id="route-detail-breakdown-heading"
                    className="text-sm font-semibold text-[#0F172A]"
                  >
                    Factor Breakdown · {activeDetailRoute.name}
                  </h2>
                  <span className="font-mono text-xs font-semibold text-[#0F172A]">
                    {activeDetailRoute.riskScore} pts
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <dt className="text-[#64748B]">Distance Factor</dt>
                    <dd className="text-sm font-mono font-semibold text-[#0F172A] mt-1">
                      +{activeDetailRoute.scoreBreakdown.distanceContribution} pts{" "}
                      <span className="text-[11px] font-normal text-[#64748B]">
                        ({activeDetailRoute.distanceMeters} m)
                      </span>
                    </dd>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <dt className="text-[#64748B]">Plume Exposure</dt>
                    <dd className="text-sm font-mono font-semibold text-[#0F172A] mt-1">
                      +{activeDetailRoute.scoreBreakdown.exposureContribution} pts{" "}
                      <span className="text-[11px] font-normal text-[#64748B]">
                        (Idx {activeDetailRoute.hazardExposure})
                      </span>
                    </dd>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <dt className="text-[#64748B]">Worker Density</dt>
                    <dd className="text-sm font-mono font-semibold text-[#0F172A] mt-1">
                      +{activeDetailRoute.scoreBreakdown.densityContribution} pts{" "}
                      <span className="text-[11px] font-normal text-[#64748B]">
                        (Idx {activeDetailRoute.densityScore})
                      </span>
                    </dd>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <dt className="text-[#64748B]">Access Penalty</dt>
                    <dd className="text-sm font-mono font-semibold text-[#0F172A] mt-1">
                      +{activeDetailRoute.scoreBreakdown.accessibilityPenalty} pts{" "}
                      <span className="text-[11px] font-normal text-[#64748B]">
                        ({activeDetailRoute.accessible ? "Open" : "Blocked"})
                      </span>
                    </dd>
                  </div>
                </dl>

                <p className="text-[11px] text-[#64748B] font-mono pt-1">
                  Score = w_dist·D + w_exp·E + w_den·C + w_acc·A
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* ================================================================
            FACILITY-WIDE STATIONARY POSTS EVACUATION MATRIX (8 POSTS)
            ================================================================ */}
        <Card className="p-5 sm:p-6 space-y-4 border-[#E2E8F0]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" aria-hidden="true" />
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  Alokasi Koridor Evakuasi Pos Stasioner Seluruh Level (8 Pos Fasilitas)
                </h2>
              </div>
              <p className="text-xs text-[#475569]">
                Distribusi rute aman dan status gerbang pelarian untuk seluruh pos depo: memastikan keselamatan operator, inspektur sidak, hingga penjaga pos jaga gerbang.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerSideBInspectionScenario}
              className={`rounded-xl text-xs font-semibold ${
                isSideBScenarioActive ? "border-amber-400 bg-amber-50 text-amber-900" : ""
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
              <span>Simulasi Sidak Side B</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAFC]">
                  <TableHead className="font-bold text-[#0F172A] text-xs">Pos Stasioner</TableHead>
                  <TableHead className="text-xs">Zona Operasi</TableHead>
                  <TableHead className="text-xs">Personel & Level</TableHead>
                  <TableHead className="text-xs">Status Risiko</TableHead>
                  <TableHead className="text-xs">Koridor Tertugaskan</TableHead>
                  <TableHead className="text-xs">Titik Kumpul</TableHead>
                  <TableHead className="text-xs">Instruksi Khusus Peran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {stationaryPosts.map((post) => {
                  const isSideB = post.id === "POST-GANTRY-B";
                  const isHighlighted = isSideB && (currentRoleLevel === "level-2-inspector" || isSideBScenarioActive);

                  return (
                    <TableRow
                      key={post.id}
                      className={isHighlighted ? "bg-amber-50/60 font-medium" : undefined}
                    >
                      <TableCell className="font-semibold text-[#0F172A]">
                        <div className="flex items-center gap-2">
                          <span>{post.name}</span>
                          {isSideB && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-200 text-amber-900 font-mono font-bold">
                              SIDE B
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#64748B] font-mono block">
                          {post.shortCode} · Est {post.estimatedEscapeTimeSec}s
                        </span>
                      </TableCell>

                      <TableCell className="text-[#475569]">{post.zone}</TableCell>

                      <TableCell>
                        <span className="font-mono font-bold text-[#0F172A]">
                          {post.totalPersonnel} Orang
                        </span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {post.personnelLevelsPresent.map((lvl) => (
                            <span
                              key={lvl}
                              className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold ${
                                lvl === "level-2-inspector"
                                  ? "bg-amber-100 text-amber-800"
                                  : lvl === "level-3-manager"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {lvl === "level-1-operator" ? "L1" : lvl === "level-2-inspector" ? "L2 Sidak" : lvl === "level-3-manager" ? "L3 Mgr" : "L4"}
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          post.currentRisk === "critical"
                            ? "bg-rose-100 text-rose-700"
                            : post.currentRisk === "high"
                            ? "bg-amber-100 text-amber-800"
                            : post.currentRisk === "moderate"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {post.currentRisk.toUpperCase()}
                        </span>
                      </TableCell>

                      <TableCell className="font-medium text-[#0F172A]">
                        {post.evacuationCorridor}
                        <span className="text-[10px] text-[#64748B] font-mono block">
                          {post.distanceMeters}m
                        </span>
                      </TableCell>

                      <TableCell className="font-bold font-mono text-[#0F172A]">
                        {post.destinationAssembly}
                      </TableCell>

                      <TableCell className="text-[#334155] max-w-xs leading-relaxed text-[11px]">
                        {currentRoleLevel === "level-2-inspector" && post.specialLevelGuidance["level-2-inspector"] ? (
                          <span className="text-amber-900 font-semibold block mb-0.5">
                            [Panduan Sidak]: {post.specialLevelGuidance["level-2-inspector"]}
                          </span>
                        ) : null}
                        <span>{post.specialLevelGuidance[currentRoleLevel] ?? post.specialLevelGuidance["level-1-operator"]}</span>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono">
                          <span className="text-[#64748B]">Akses Gerbang:</span>
                          <span className="font-bold text-emerald-600">{post.gateAccessStatus}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* ================================================================
            AI EXPLOSION RADIUS & CORRIDOR SAFETY BOUNDARY VERIFICATION
            ================================================================ */}
        <Card className="p-5 sm:p-6 space-y-4 border-[#E2E8F0] bg-slate-900 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" aria-hidden="true" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Verifikasi Batas Aman Koridor Terhadap Radius Ledakan BLEVE Tangki T-102
                </h3>
                <p className="text-xs text-slate-400">
                  Model Prediksi AI Ledakan Kilang: Probabilitas {aiExplosionPrediction.probabilityPct}% · Waktu Kritis Menuju Kegagalan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                Lethal: {aiExplosionPrediction.blastWaveRadii.lethalOverpressureMeters}m · Safe: {aiExplosionPrediction.blastWaveRadii.glassBreakageMeters}m
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Koridor Rute B (Jalur Selatan Bypass) Terverifikasi Aman</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Koridor Selatan membentang pada koordinat y=472, berjarak <strong>&gt;165 meter</strong> dari pusat Tangki T-102 (370, 125). Posisi ini berada di luar batas gelombang kejut kaca (&gt;1 psi / 145m) dan radiasi panas mematikan.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Koridor Manifold Pusat (PIPE-01) Berada di Zona Bahaya Tinggi</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Rak pipa manifold PIPE-01 (y=234) berjarak hanya <strong>70-85 meter</strong> dari T-102, berada tepat di dalam radius Kerusakan Struktural Berat (88m). Semua rute yang melintasi koridor ini otomatis diblokir sistem.
              </p>
            </div>
          </div>
        </Card>
      </UIStateWrapper>
    </div>
  );
}
