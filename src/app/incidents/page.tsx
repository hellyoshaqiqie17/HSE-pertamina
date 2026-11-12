"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  ClipboardList,
  Compass,
  Play,
  Search,
} from "lucide-react";
import { useEvora } from "@/lib/evora-context";
import { RiskBadge } from "@/components/shared/status-badge";
import { UIStateWrapper } from "@/components/shared/ui-state-wrapper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskLevel } from "@/types/evora";

export default function IncidentsAndScenariosPage() {
  const { incidents, scenarios, applyScenarioPreset } = useEvora();

  const [incidentSearch, setIncidentSearch] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<RiskLevel | "all">(
    "all"
  );
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    incidents[0]?.id ?? "INC-2026-01"
  );
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<string>("SCN-GAS-01");

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        incidentSearch.trim() === "" ||
        inc.code.toLowerCase().includes(incidentSearch.toLowerCase()) ||
        inc.scenarioName.toLowerCase().includes(incidentSearch.toLowerCase()) ||
        inc.location.toLowerCase().includes(incidentSearch.toLowerCase());
      const matchesSeverity =
        severityFilter === "all" || inc.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [incidentSearch, incidents, severityFilter]);

  const activeIncident =
    incidents.find((i) => i.id === selectedIncidentId) ??
    filteredIncidents[0] ??
    incidents[0];

  const activeScenario =
    scenarios.find((s) => s.id === selectedScenarioId) ?? scenarios[0];

  const comparisonChartData = activeScenario.comparisonMetrics.map((m) => ({
    method:
      m.method === "EVORA Adaptive Recommendation"
        ? "EVORA Adaptive"
        : m.method === "Shortest-Route Method"
        ? "Shortest-Route"
        : "Static Signage",
    evacuationTimeSec: m.evacuationTimeSec,
    hazardExposureIndex: m.hazardExposureIndex,
    routeSafetyScore: m.routeSafetyScore,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" dot>
              Evaluation Benchmarks
            </Badge>
            <span className="text-xs text-[#64748B]">
              · 5-Dimension Method Comparison
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Incidents &amp; Scenarios{" "}
            <span className="font-normal text-[#64748B]">#2026</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1">
            Review multi-hazard incident logs and evaluate outcomes across
            Static Signage, Shortest-Route, and EVORA Adaptive guidance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/evacuation"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2.5 rounded-xl btn-embossed text-xs font-medium"
          >
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Open Evacuation Assessment</span>
          </Link>
        </div>
      </div>

      <UIStateWrapper pageTitle="Incidents & Scenario Management">
        {/* Top Section: Scenario Library & 5-Dimension Method Comparison */}
        <Card
          aria-labelledby="scenario-comparison-heading"
          className="p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <BookOpen
                  className="w-4 h-4 text-[#475569] shrink-0"
                  aria-hidden="true"
                />
                <h2
                  id="scenario-comparison-heading"
                  className="text-sm sm:text-base font-semibold text-[#0F172A]"
                >
                  Scenario Library &amp; Multi-Method Evaluation Matrix
                </h2>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Compares Static Signage, Shortest-Route Method, and EVORA
                Adaptive Recommendation across evacuation time, hazard exposure,
                route safety, worker density, and guidance update latency.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <label
                htmlFor="comparison-scenario-select"
                className="text-xs font-medium text-[#475569]"
              >
                Scenario:
              </label>
              <select
                id="comparison-scenario-select"
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                className="text-xs font-medium text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 h-9"
              >
                {scenarios.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant="default"
                onClick={() => applyScenarioPreset(activeScenario.id)}
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Load Scenario</span>
              </Button>
            </div>
          </div>

          {/* 3 Selectable Scenario Library Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scen) => {
              const isSelected = scen.id === activeScenario.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => setSelectedScenarioId(scen.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedScenarioId(scen.id);
                    }
                  }}
                  className={`p-4 rounded-2xl border text-xs transition-all bg-white ${
                    isSelected
                      ? "border-[#0F172A] ring-1 ring-[#0F172A]/10 shadow-xs"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-md">
                      {scen.code}
                    </span>
                    <RiskBadge level={scen.severity} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">
                    {scen.name}
                  </h3>
                  <p className="text-[#475569] mt-1 leading-relaxed">
                    {scen.description}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between font-mono text-[11px] text-[#64748B]">
                    <span>Wind: {scen.windSpeedMps} m/s {scen.windDirectionLabel}</span>
                    <span>Cohort: {scen.defaultWorkerCount} agents</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison Table & Chart Split */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start pt-2">
            {/* 5-Dimension Comparison Table (7 cols) */}
            <div className="xl:col-span-7 space-y-2.5">
              <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A]">
                Five-Dimension Evaluation Matrix · {activeScenario.name}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Evac Time</TableHead>
                    <TableHead>Exposure Idx</TableHead>
                    <TableHead>Route Safety</TableHead>
                    <TableHead>Peak Density</TableHead>
                    <TableHead>Latency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeScenario.comparisonMetrics.map((row) => {
                    const isEvora =
                      row.method === "EVORA Adaptive Recommendation";
                    return (
                      <TableRow
                        key={row.method}
                        data-state={isEvora ? "selected" : undefined}
                      >
                        <TableCell>
                          <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                            {isEvora && (
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"
                                aria-hidden="true"
                              />
                            )}
                            <span>{row.method}</span>
                          </div>
                          <div className="text-[11px] font-normal text-[#64748B] mt-0.5">
                            {row.notes}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-semibold tabular-nums text-[#0F172A]">
                          {row.evacuationTimeSec} s
                        </TableCell>
                        <TableCell className="font-mono font-semibold tabular-nums text-[#0F172A]">
                          {row.hazardExposureIndex} / 100
                        </TableCell>
                        <TableCell className="font-mono font-semibold tabular-nums text-[#0F172A]">
                          {row.routeSafetyScore} / 100
                        </TableCell>
                        <TableCell className="font-mono tabular-nums text-[#475569]">
                          {row.peakWorkerDensity} p/m2
                        </TableCell>
                        <TableCell className="font-mono tabular-nums text-[#64748B]">
                          {row.guidanceLatencyMs === 0
                            ? "N/A (Static)"
                            : `${row.guidanceLatencyMs} ms`}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Grouped Comparison Bar Chart (5 cols) */}
            <div className="xl:col-span-5 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <h3 className="text-xs font-semibold text-[#0F172A] mb-1">
                Method Comparison Across Time, Exposure &amp; Safety
              </h3>
              <p className="text-[11px] text-[#64748B] mb-3">
                Lower Evacuation Time and Exposure Index are safer; higher Route
                Safety Score is safer.
              </p>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="method"
                      tick={{ fontSize: 10.5, fill: "#0F172A" }}
                    />
                    <YAxis tick={{ fontSize: 10.5, fill: "#64748B" }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="evacuationTimeSec"
                      name="Evac Time (s)"
                      fill="#0F172A"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="hazardExposureIndex"
                      name="Exposure (0-100)"
                      fill="#C84B28"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="routeSafetyScore"
                      name="Safety (0-100)"
                      fill="#64748B"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>

        {/* Bottom Section: Simulated Incident Log Table (Left 7 cols) + Incident Event Timeline (Right 5 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Simulated Incident List */}
          <Card
            aria-labelledby="incident-list-heading"
            className="xl:col-span-7 p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
              <h2
                id="incident-list-heading"
                className="text-sm sm:text-base font-semibold text-[#0F172A] flex items-center gap-2"
              >
                <ClipboardList
                  className="w-4 h-4 text-[#475569]"
                  aria-hidden="true"
                />
                <span>Incident &amp; Drill Log ({filteredIncidents.length})</span>
              </h2>
              <Badge variant="neutral" dot>
                Audit Log
              </Badge>
            </div>

            {/* Search & Severity Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="incident-search-input"
                  className="block text-xs font-medium text-[#475569] mb-1"
                >
                  Search Code or Zone
                </label>
                <div className="relative">
                  <Search
                    className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5"
                    aria-hidden="true"
                  />
                  <input
                    id="incident-search-input"
                    type="search"
                    value={incidentSearch}
                    onChange={(e) => setIncidentSearch(e.target.value)}
                    placeholder="SIM-INC-01 or Tank T-102..."
                    className="w-full pl-8 pr-3 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="incident-severity-filter"
                  className="block text-xs font-medium text-[#475569] mb-1"
                >
                  Filter by Severity
                </label>
                <select
                  id="incident-severity-filter"
                  value={severityFilter}
                  onChange={(e) =>
                    setSeverityFilter(e.target.value as RiskLevel | "all")
                  }
                  className="w-full px-3 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A]"
                >
                  <option value="all">All Severity Levels</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="elevated">Elevated</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>

            {filteredIncidents.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-3">
                <p className="text-sm font-semibold text-[#0F172A]">
                  No incidents match your filter.
                </p>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => {
                    setIncidentSearch("");
                    setSeverityFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code &amp; Time</TableHead>
                    <TableHead>Scenario &amp; Zone</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((inc) => {
                    const isSelected = activeIncident?.id === inc.id;
                    return (
                      <TableRow
                        key={inc.id}
                        data-state={isSelected ? "selected" : undefined}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        className="cursor-pointer"
                      >
                        <TableCell className="font-mono">
                          <div className="font-semibold text-[#0F172A]">
                            {inc.code}
                          </div>
                          <div className="text-[#64748B] text-[11px]">
                            {inc.timestamp}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-[#0F172A]">
                            {inc.scenarioName}
                          </div>
                          <div className="text-[#64748B] text-[11px]">
                            {inc.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <RiskBadge level={inc.severity} />
                        </TableCell>
                        <TableCell className="font-medium text-[#475569]">
                          {inc.status}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIncidentId(inc.id);
                            }}
                          >
                            {isSelected ? "Active" : "Timeline"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>

          {/* Right 5 Cols: Selected Incident Detail & Step-by-Step Timeline */}
          {activeIncident && (
            <Card
              aria-labelledby="incident-detail-heading"
              className="xl:col-span-5 p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-2 pb-3.5 border-b border-[#F1F5F9]">
                <div>
                  <span className="text-xs font-mono text-[#64748B]">
                    Record · {activeIncident.code}
                  </span>
                  <h2
                    id="incident-detail-heading"
                    className="text-base font-semibold text-[#0F172A] mt-0.5"
                  >
                    {activeIncident.scenarioName}
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {activeIncident.location} · {activeIncident.timestamp}
                  </p>
                </div>
                <RiskBadge level={activeIncident.severity} />
              </div>

              <p className="text-xs text-[#475569] leading-relaxed">
                {activeIncident.summary}
              </p>

              {/* Outcome KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-[#64748B]">Evacuated</div>
                  <div className="font-mono font-bold text-[#0F172A] text-sm mt-1">
                    {activeIncident.outcomeMetrics.evacuatedWorkers}/
                    {activeIncident.outcomeMetrics.totalWorkers}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-[#64748B]">Avg Time</div>
                  <div className="font-mono font-bold text-[#0F172A] text-sm mt-1">
                    {activeIncident.outcomeMetrics.avgEvacuationTimeSec}s
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-[#64748B]">Blocked Routes</div>
                  <div className="font-mono font-bold text-[#0F172A] text-sm mt-1">
                    {activeIncident.outcomeMetrics.blockedRoutesCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-[#64748B]">Signage Sync</div>
                  <div className="font-mono font-bold text-[#0F172A] text-sm mt-1">
                    {activeIncident.outcomeMetrics.signageUpdateLatencyMs} ms
                  </div>
                </div>
              </div>

              {/* Event Sequence Timeline */}
              <div>
                <h3 className="text-xs font-semibold text-[#0F172A] mb-2.5">
                  Event &amp; Decision Sequence
                </h3>
                <ol className="space-y-2.5">
                  {activeIncident.timeline.map((step, idx) => (
                    <li
                      key={`${step.time}-${idx}`}
                      className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono font-medium text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#E2E8F0] text-[#0F172A]">
                          {step.actor}
                        </span>
                        <span className="font-mono text-[#64748B] tabular-nums">
                          {step.time} WIB
                        </span>
                      </div>
                      <p className="text-[#475569] leading-relaxed">
                        {step.event}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </Card>
          )}
        </div>
      </UIStateWrapper>
    </div>
  );
}
