"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Radio,
  RotateCcw,
  Search,
  Sliders,
  Thermometer,
  WifiOff,
  Wind,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEvora } from "@/lib/evora-context";
import { SensorStatusBadge } from "@/components/shared/status-badge";
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
import { SensorStatus, SensorType } from "@/types/evora";

export default function SensorsPage() {
  const {
    currentFacility,
    sensors,
    toggleSensorFault,
    triggerSensorSpike,
    updateSensorThresholds,
    resetDemoState,
  } = useEvora();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<SensorType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SensorStatus | "all">("all");
  const [selectedSensorId, setSelectedSensorId] = useState<string>(
    sensors[0]?.id ?? "SNS-GAS-02"
  );

  const filteredSensors = useMemo(() => {
    return sensors.filter((s) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || s.type === typeFilter;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, sensors, statusFilter, typeFilter]);

  const activeSensor =
    sensors.find((s) => s.id === selectedSensorId) ??
    filteredSensors[0] ??
    sensors[0];

  const totalCount = sensors.length;
  const onlineCount = sensors.filter((s) => s.status !== "offline").length;
  const warningOrCriticalCount = sensors.filter(
    (s) => s.status === "warning" || s.status === "critical"
  ).length;
  const offlineCount = sensors.filter((s) => s.status === "offline").length;

  const renderSensorTypeIcon = (type: SensorType) => {
    switch (type) {
      case "temperature":
        return <Thermometer className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />;
      case "gas":
        return <AlertTriangle className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />;
      case "smoke":
      case "fire":
        return <Flame className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />;
      case "wind":
        return <Wind className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" dot>
              MQTT Edge Telemetry
            </Badge>
            <span className="text-xs text-[#64748B]">
              · Environmental Node Fleet
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            IoT Sensor Telemetry{" "}
            <span className="font-normal text-[#64748B]">#204</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1">
            Environmental telemetry nodes (temperature, hydrocarbon gas, smoke,
            flame, and ultrasonic wind) feeding the Digital Twin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetDemoState}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />
            <span>Reset All Nodes</span>
          </Button>
        </div>
      </div>

      <UIStateWrapper pageTitle="IoT Sensor Monitoring">
        {/* 4 Sensor Summary Cards */}
        <section
          aria-label="Sensor fleet summary"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="p-4.5">
            <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
              <span>Deployed Nodes</span>
              <span className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F172A]">
                <Radio className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-2">
              {totalCount}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Active across {currentFacility.code}
            </p>
          </Card>

          <Card className="p-4.5">
            <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
              <span>Online Telemetry</span>
              <span className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F172A]">
                <CheckCircle2
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                />
              </span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-2">
              {onlineCount}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              1 Hz sampling interval
            </p>
          </Card>

          <Card className="p-4.5">
            <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
              <span>Threshold Exceedance</span>
              <span className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#C84B28]">
                <AlertTriangle
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                />
              </span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-2">
              {warningOrCriticalCount}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Above warning or critical limit
            </p>
          </Card>

          <Card className="p-4.5">
            <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
              <span>Offline / Fault</span>
              <span className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-2">
              {offlineCount}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Toggle fault in inspector
            </p>
          </Card>
        </section>

        {/* Main Split: Sensor Table & Filters (Left 7 cols) + Selected Sensor Telemetry & Threshold Config (Right 5 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Search, Filters, and Sensor Table */}
          <Card
            aria-labelledby="sensor-table-heading"
            className="xl:col-span-7 p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
              <h2
                id="sensor-table-heading"
                className="text-sm sm:text-base font-semibold text-[#0F172A]"
              >
                Facility Sensor Registry ({filteredSensors.length} of{" "}
                {sensors.length})
              </h2>
              <span className="text-xs text-[#64748B]">
                Select any node to inspect telemetry
              </span>
            </div>

            {/* Search & Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="sensor-search-input"
                  className="block text-xs font-medium text-[#475569] mb-1"
                >
                  Search Node
                </label>
                <div className="relative">
                  <Search
                    className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5"
                    aria-hidden="true"
                  />
                  <input
                    id="sensor-search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="GS-204 or Manifold..."
                    className="w-full pl-8 pr-3 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="sensor-type-filter"
                  className="block text-xs font-medium text-[#475569] mb-1"
                >
                  Sensor Type
                </label>
                <select
                  id="sensor-type-filter"
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as SensorType | "all")
                  }
                  className="w-full px-3 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A]"
                >
                  <option value="all">All Types (5)</option>
                  <option value="temperature">Temperature (deg C)</option>
                  <option value="gas">Hydrocarbon Gas (% LEL)</option>
                  <option value="smoke">Smoke (ppm)</option>
                  <option value="fire">Flame (IR Index)</option>
                  <option value="wind">Wind Anemometer (m/s)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="sensor-status-filter"
                  className="block text-xs font-medium text-[#475569] mb-1"
                >
                  Node Status
                </label>
                <select
                  id="sensor-status-filter"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as SensorStatus | "all")
                  }
                  className="w-full px-3 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A]"
                >
                  <option value="all">All Statuses</option>
                  <option value="online">Online</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            {/* Table or Empty Filter State */}
            {filteredSensors.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-3">
                <p className="text-sm font-semibold text-[#0F172A]">
                  No sensors match your current filter.
                </p>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Node</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Reading</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSensors.map((sensor) => {
                    const isSelected = activeSensor?.id === sensor.id;
                    return (
                      <TableRow
                        key={sensor.id}
                        data-state={isSelected ? "selected" : undefined}
                        onClick={() => setSelectedSensorId(sensor.id)}
                        className="cursor-pointer"
                      >
                        <TableCell>
                          <div className="font-mono font-semibold text-[#0F172A]">
                            {sensor.id}
                          </div>
                          <div className="text-[#64748B] text-[11px]">
                            {sensor.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 capitalize font-medium text-[#0F172A]">
                            {renderSensorTypeIcon(sensor.type)}
                            <span>{sensor.type}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-[#475569]">
                          {sensor.location}
                        </TableCell>
                        <TableCell className="font-mono font-semibold tabular-nums text-[#0F172A]">
                          {sensor.status === "offline"
                            ? "NO SIGNAL"
                            : `${sensor.value} ${sensor.unit}`}
                          {sensor.windDirectionCardinal && (
                            <span className="block text-[10px] font-normal text-[#64748B]">
                              Dir: {sensor.windDirectionCardinal}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <SensorStatusBadge status={sensor.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSensorId(sensor.id);
                            }}
                          >
                            {isSelected ? "Active" : "Inspect"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>

          {/* Right 5 Cols: Selected Sensor Telemetry Chart, Fault Toggle, Reading Spike & Threshold Config */}
          {activeSensor && (
            <div className="xl:col-span-5 space-y-5">
              <Card
                aria-labelledby="sensor-detail-heading"
                className="p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3.5 border-b border-[#F1F5F9]">
                  <div>
                    <div className="text-xs font-mono text-[#64748B]">
                      Node · {activeSensor.id}
                    </div>
                    <h2
                      id="sensor-detail-heading"
                      className="text-base font-semibold text-[#0F172A] mt-0.5"
                    >
                      {activeSensor.name}
                    </h2>
                    <div className="text-xs text-[#64748B] mt-0.5">
                      {activeSensor.location} · Sync{" "}
                      <span className="font-mono">{activeSensor.lastUpdated}</span>
                    </div>
                  </div>
                  <SensorStatusBadge status={activeSensor.status} />
                </div>

                {/* Minimalist Threshold Exceedance Notice */}
                {(activeSensor.status === "warning" ||
                  activeSensor.status === "critical") && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs flex items-start gap-2.5"
                  >
                    <AlertTriangle
                      className="w-4 h-4 text-[#C84B28] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-semibold text-[#0F172A]">
                        Reading exceeds configured {activeSensor.status} threshold
                      </div>
                      <p className="text-[#475569] mt-0.5 leading-relaxed">
                        Current reading (
                        <strong className="text-[#0F172A]">
                          {activeSensor.value} {activeSensor.unit}
                        </strong>
                        ) exceeds the {activeSensor.status} limit (
                        {activeSensor.status === "critical"
                          ? activeSensor.criticalThreshold
                          : activeSensor.warningThreshold}{" "}
                        {activeSensor.unit}).
                      </p>
                    </div>
                  </div>
                )}

                {/* Key Telemetry Readout Strip */}
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-[#64748B]">Live Reading</div>
                    <div className="text-base font-mono font-bold tabular-nums text-[#0F172A] mt-1">
                      {activeSensor.status === "offline"
                        ? "--"
                        : `${activeSensor.value} ${activeSensor.unit}`}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-[#64748B]">Warning Limit</div>
                    <div className="text-base font-mono font-bold tabular-nums text-[#0F172A] mt-1">
                      {activeSensor.warningThreshold} {activeSensor.unit}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-[#64748B]">Critical Limit</div>
                    <div className="text-base font-mono font-bold tabular-nums text-[#0F172A] mt-1">
                      {activeSensor.criticalThreshold} {activeSensor.unit}
                    </div>
                  </div>
                </div>

                {/* Historical Telemetry Chart */}
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <h3 className="text-xs font-semibold text-[#0F172A] mb-2">
                    30-Minute Telemetry Trend ({activeSensor.id})
                  </h3>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activeSensor.history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 10, fill: "#64748B" }}
                        />
                        <YAxis tick={{ fontSize: 10, fill: "#64748B" }} />
                        <Tooltip />
                        <ReferenceLine
                          y={activeSensor.warningThreshold}
                          stroke="#D97706"
                          strokeDasharray="4 4"
                        />
                        <ReferenceLine
                          y={activeSensor.criticalThreshold}
                          stroke="#C84B28"
                          strokeDasharray="4 4"
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name={`${activeSensor.name} (${activeSensor.unit})`}
                          stroke="#0F172A"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Interactive Fault & Reading Update Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#F1F5F9]">
                  <Button
                    type="button"
                    variant="embossed"
                    onClick={() => triggerSensorSpike(activeSensor.id)}
                    disabled={activeSensor.status === "offline"}
                  >
                    <Zap className="w-3.5 h-3.5 text-[#C84B28]" aria-hidden="true" />
                    <span>Trigger Reading Spike</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => toggleSensorFault(activeSensor.id)}
                  >
                    <WifiOff className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />
                    <span>
                      {activeSensor.status === "offline"
                        ? "Restore Node Online"
                        : "Simulate Node Fault"}
                    </span>
                  </Button>
                </div>
              </Card>

              {/* Configurable Threshold Settings Card */}
              <Card
                aria-labelledby="threshold-settings-heading"
                className="p-5 sm:p-6 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <h2
                    id="threshold-settings-heading"
                    className="text-sm font-semibold text-[#0F172A] flex items-center gap-2"
                  >
                    <Sliders className="w-4 h-4 text-[#475569]" aria-hidden="true" />
                    <span>Threshold Calibration ({activeSensor.id})</span>
                  </h2>
                  <Badge variant="neutral" dot>
                    Editable
                  </Badge>
                </div>
                <p className="text-xs text-[#64748B]">
                  Adjust warning and critical thresholds to test live status
                  transitions across the Digital Twin.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label
                      htmlFor="warn-threshold-input"
                      className="block font-medium text-[#475569] mb-1"
                    >
                      Warning Threshold ({activeSensor.unit})
                    </label>
                    <input
                      id="warn-threshold-input"
                      type="number"
                      step="1"
                      value={activeSensor.warningThreshold}
                      onChange={(e) =>
                        updateSensorThresholds(
                          activeSensor.id,
                          Number(e.target.value),
                          activeSensor.criticalThreshold
                        )
                      }
                      className="w-full px-3 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-mono font-semibold text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="crit-threshold-input"
                      className="block font-medium text-[#475569] mb-1"
                    >
                      Critical Threshold ({activeSensor.unit})
                    </label>
                    <input
                      id="crit-threshold-input"
                      type="number"
                      step="1"
                      value={activeSensor.criticalThreshold}
                      onChange={(e) =>
                        updateSensorThresholds(
                          activeSensor.id,
                          activeSensor.warningThreshold,
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-mono font-semibold text-[#0F172A]"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </UIStateWrapper>
    </div>
  );
}
