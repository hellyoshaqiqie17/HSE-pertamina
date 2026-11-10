"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRightLeft,
  Boxes,
  Calculator,
  Flame,
  RotateCcw,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E2DE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" dot>
              Adaptive Routing Engine
            </Badge>
            <span className="text-xs text-[#68686F]">
              · Multi-Criteria Corridor Evaluation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
            Adaptive Evacuation{" "}
            <span className="font-normal text-[#68686F]">#A-01</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#52525B] mt-1">
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
            <Calculator className="w-3.5 h-3.5 text-[#52525B]" aria-hidden="true" />
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
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 py-2 text-xs font-medium rounded-xl bg-white text-[#18181B] border border-[#E2E2DE] hover:bg-[#F7F7F4] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <Boxes className="w-3.5 h-3.5 text-[#52525B]" aria-hidden="true" />
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
                <span className="text-xs font-mono text-[#68686F]">
                  Threshold &le; {scoringConfig.riskThreshold}/100
                </span>
              </div>

              <h2
                id="guided-demo-heading"
                className="text-base sm:text-lg font-semibold text-[#18181B] tracking-tight"
              >
                {hazardExpansionStep === 0
                  ? "Route A (North-West Upwind Corridor) is Currently Recommended"
                  : "Route A Blocked by Westward Plume · Route B Promoted"}
              </h2>

              <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
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
                <Flame className="w-3.5 h-3.5 text-[#C84B28]" aria-hidden="true" />
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
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#EFEFEA]">
              <div>
                <h2
                  id="route-comparison-heading"
                  className="text-sm sm:text-base font-semibold text-[#18181B]"
                >
                  Candidate Corridor Comparison Matrix
                </h2>
                <p className="text-xs text-[#68686F] mt-0.5">
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
                    <TableCell className="font-semibold text-[#18181B]">
                      {rt.name}{" "}
                      <span className="font-mono text-[#68686F] font-normal">
                        ({rt.id})
                      </span>
                    </TableCell>
                    <TableCell>
                      <RouteStatusBadge status={rt.status} />
                    </TableCell>
                    <TableCell className="font-mono font-semibold tabular-nums">
                      {rt.riskScore}/100{" "}
                      <span className="text-[11px] font-normal text-[#68686F]">
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
                    <TableCell className="text-[#52525B]">
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
              <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#EFEFEA]">
                <div>
                  <span className="text-xs font-medium text-[#68686F] block">
                    Decision Output
                  </span>
                  <h2
                    id="decision-summary-heading"
                    className="text-sm sm:text-base font-semibold text-[#18181B]"
                  >
                    Active Evacuation Recommendation
                  </h2>
                </div>
                <Badge variant="neutral" dot>
                  Live Formula
                </Badge>
              </div>

              {recommendedRoute ? (
                <div className="p-4 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-medium text-[#52525B]">
                      Primary Corridor · {recommendedRoute.id}
                    </span>
                    <RouteStatusBadge status="recommended" />
                  </div>
                  <div className="text-base font-semibold text-[#18181B]">
                    {recommendedRoute.name}
                  </div>
                  <div className="text-xs text-[#52525B]">
                    Origin: <strong className="text-[#18181B]">{recommendedRoute.originZone}</strong>{" "}
                    · Muster:{" "}
                    <strong className="text-[#18181B]">{recommendedRoute.destinationName}</strong>
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed pt-1 border-t border-[#E2E2DE]">
                    {recommendedRoute.explanation}
                  </p>
                </div>
              ) : (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] space-y-2"
                >
                  <div className="flex items-center gap-2 text-[#18181B] font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4 text-[#C84B28]" aria-hidden="true" />
                    <span>No Safe Corridor Below Threshold</span>
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed">
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
                    <Sliders className="w-3.5 h-3.5 text-[#52525B]" aria-hidden="true" />
                    <span>
                      Threshold ({scoringConfig.riskThreshold}/100) &amp; Weights
                    </span>
                  </span>
                  <span className="font-mono text-[#68686F]">
                    {showScoringDrawer ? "Hide" : "Configure"}
                  </span>
                </Button>

                {showScoringDrawer && (
                  <div className="mt-3 p-4 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between font-medium text-[#18181B] mb-1.5">
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
                        className="w-full accent-[#18181B]"
                      />
                      <p className="text-[11px] text-[#68686F] mt-1">
                        Lower threshold to 20 to test the shelter-in-place safety fallback.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#E2E2DE]">
                      <div>
                        <label
                          htmlFor="weight-exposure"
                          className="block font-medium text-[#52525B] mb-1"
                        >
                          Exposure Weight:{" "}
                          <strong className="font-mono text-[#18181B]">
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
                          className="w-full accent-[#18181B]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="weight-distance"
                          className="block font-medium text-[#52525B] mb-1"
                        >
                          Distance Weight:{" "}
                          <strong className="font-mono text-[#18181B]">
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
                          className="w-full accent-[#18181B]"
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
              <div className="flex items-center justify-between pb-3 border-b border-[#EFEFEA]">
                <h2
                  id="candidate-routes-heading"
                  className="text-sm sm:text-base font-semibold text-[#18181B]"
                >
                  Candidate Evacuation Corridors
                </h2>
                <span className="text-xs font-mono text-[#68686F]">
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
                          ? "border-[#18181B] ring-1 ring-[#18181B]/10 shadow-xs"
                          : "border-[#E2E2DE] hover:border-[#D4D4CE]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#F7F7F4] border border-[#E2E2DE] text-[#18181B]">
                            {route.shortCode}
                          </span>
                          <h3 className="text-sm font-semibold text-[#18181B]">
                            {route.name}
                          </h3>
                        </div>
                        <RouteStatusBadge status={route.status} />
                      </div>

                      {/* 4 Evaluation Criteria Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE] text-xs">
                        <div>
                          <div className="text-[11px] text-[#68686F]">
                            Distance
                          </div>
                          <div className="font-mono font-semibold tabular-nums text-[#18181B] mt-0.5">
                            {route.distanceMeters} m{" "}
                            <span className="font-normal text-[#68686F]">
                              ({route.estimatedTimeSeconds}s)
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-[#68686F]">
                            Exposure
                          </div>
                          <div className="font-mono font-semibold tabular-nums text-[#18181B] mt-0.5">
                            {route.hazardExposure}/100
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-[#68686F]">
                            Density
                          </div>
                          <div className="font-mono font-semibold tabular-nums text-[#18181B] mt-0.5">
                            {route.densityScore}/100
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-[#68686F]">
                            Access
                          </div>
                          <div className="font-medium text-[#18181B] mt-0.5 flex items-center gap-1">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                route.accessible
                                  ? "bg-emerald-500"
                                  : "bg-[#C84B28]"
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
                          <span className="text-[#68686F]">
                            Composite Risk Score
                          </span>
                          <span className="font-mono font-semibold tabular-nums text-[#18181B]">
                            {route.riskScore} / 100
                          </span>
                        </div>
                        <Progress
                          value={route.riskScore}
                          indicatorClassName={
                            route.status === "blocked"
                              ? "bg-[#C84B28]"
                              : "bg-[#18181B]"
                          }
                        />
                      </div>

                      <p className="text-xs text-[#52525B] leading-relaxed mb-3">
                        {route.explanation}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#EFEFEA]">
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
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEFEA]">
                  <h2
                    id="route-detail-breakdown-heading"
                    className="text-sm font-semibold text-[#18181B]"
                  >
                    Factor Breakdown · {activeDetailRoute.name}
                  </h2>
                  <span className="font-mono text-xs font-semibold text-[#18181B]">
                    {activeDetailRoute.riskScore} pts
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE]">
                    <dt className="text-[#68686F]">Distance Factor</dt>
                    <dd className="text-sm font-mono font-semibold text-[#18181B] mt-1">
                      +{activeDetailRoute.scoreBreakdown.distanceContribution} pts{" "}
                      <span className="text-[11px] font-normal text-[#68686F]">
                        ({activeDetailRoute.distanceMeters} m)
                      </span>
                    </dd>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE]">
                    <dt className="text-[#68686F]">Plume Exposure</dt>
                    <dd className="text-sm font-mono font-semibold text-[#18181B] mt-1">
                      +{activeDetailRoute.scoreBreakdown.exposureContribution} pts{" "}
                      <span className="text-[11px] font-normal text-[#68686F]">
                        (Idx {activeDetailRoute.hazardExposure})
                      </span>
                    </dd>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE]">
                    <dt className="text-[#68686F]">Worker Density</dt>
                    <dd className="text-sm font-mono font-semibold text-[#18181B] mt-1">
                      +{activeDetailRoute.scoreBreakdown.densityContribution} pts{" "}
                      <span className="text-[11px] font-normal text-[#68686F]">
                        (Idx {activeDetailRoute.densityScore})
                      </span>
                    </dd>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E2E2DE]">
                    <dt className="text-[#68686F]">Access Penalty</dt>
                    <dd className="text-sm font-mono font-semibold text-[#18181B] mt-1">
                      +{activeDetailRoute.scoreBreakdown.accessibilityPenalty} pts{" "}
                      <span className="text-[11px] font-normal text-[#68686F]">
                        ({activeDetailRoute.accessible ? "Open" : "Blocked"})
                      </span>
                    </dd>
                  </div>
                </dl>

                <p className="text-[11px] text-[#68686F] font-mono pt-1">
                  Score = w_dist·D + w_exp·E + w_den·C + w_acc·A
                </p>
              </Card>
            )}
          </div>
        </div>
      </UIStateWrapper>
    </div>
  );
}
