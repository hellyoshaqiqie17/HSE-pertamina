"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  Clock,
  CloudFog,
  Compass,
  Eye,
  Flame,
  GitBranch,
  Info,
  Layers,
  Monitor,
  Navigation,
  PhoneCall,
  Play,
  Radio,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Square,
  StepForward,
  Thermometer,
  Users,
  Wind,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DetectionSourceMode,
  FLOW_PHASES,
  FLOW_SCENARIOS,
  FLOW_STEPS,
  FlowPhaseId,
  FlowRouteStatus,
  FlowScenarioId,
  FlowStepId,
  HIERARCHY_LEVELS,
  HierarchyLevelId,
  SIMULATION_STATUS_STEPS,
  SimulationStage,
  VerificationOutcome,
} from "@/data/emergency-flow";

const STAGE_ORDER: Record<SimulationStage, number> = {
  idle: 0,
  detected: 1,
  reported: 2,
  verifying: 3,
  confirmed: 4,
  activated: 5,
};

function getRouteBadgeVariant(
  status: FlowRouteStatus
): "safe" | "warning" | "critical" {
  if (status === "Available") return "safe";
  if (status === "Caution") return "warning";
  return "critical";
}

function StepIcon({
  stepId,
  className = "w-4 h-4",
}: {
  stepId: FlowStepId;
  className?: string;
}) {
  switch (stepId) {
    case "iot-sensor":
      return <Activity className={className} aria-hidden="true" />;
    case "worker-report":
      return <PhoneCall className={className} aria-hidden="true" />;
    case "alert-activation":
      return <AlertTriangle className={className} aria-hidden="true" />;
    case "initial-notification":
      return <Bell className={className} aria-hidden="true" />;
    case "field-verification":
      return <Eye className={className} aria-hidden="true" />;
    case "risk-classification":
      return <ShieldAlert className={className} aria-hidden="true" />;
    case "incident-decision":
      return <GitBranch className={className} aria-hidden="true" />;
    case "response-coordination":
      return <Building2 className={className} aria-hidden="true" />;
    case "info-update":
      return <Navigation className={className} aria-hidden="true" />;
    case "info-distribution":
      return <Radio className={className} aria-hidden="true" />;
  }
}

function ScenarioIcon({
  scenarioId,
  className = "w-3.5 h-3.5",
}: {
  scenarioId: FlowScenarioId;
  className?: string;
}) {
  if (scenarioId === "fire-incident") {
    return <Flame className={className} aria-hidden="true" />;
  }
  if (scenarioId === "smoke-detection") {
    return <CloudFog className={className} aria-hidden="true" />;
  }
  return <Wind className={className} aria-hidden="true" />;
}

interface DiagramNodeButtonProps {
  stepId: FlowStepId;
  selectedStepId: FlowStepId;
  isReached: boolean;
  isDimmed?: boolean;
  compact?: boolean;
  statusTag?: string;
  statusTone?: "neutral" | "accent" | "safe" | "warning" | "critical";
  onSelect: (stepId: FlowStepId) => void;
  children?: React.ReactNode;
}

function DiagramNodeButton({
  stepId,
  selectedStepId,
  isReached,
  isDimmed = false,
  compact = false,
  statusTag,
  statusTone = "neutral",
  onSelect,
  children,
}: DiagramNodeButtonProps) {
  const step = FLOW_STEPS.find((s) => s.id === stepId)!;
  const isSelected = selectedStepId === stepId;

  const toneBadgeClass =
    statusTone === "safe"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : statusTone === "warning"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : statusTone === "critical"
      ? "bg-red-50 text-red-700 border-red-200"
      : statusTone === "accent"
      ? "bg-[#EEF2FF] text-[#4B6BFB] border-[#4B6BFB]/30"
      : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]";

  return (
    <div
      className={`w-full text-left rounded-xl border transition-all ${
        compact ? "p-3" : "p-3.5"
      } ${
        isSelected
          ? "bg-[#EEF2FF]/65 border-[#4B6BFB] shadow-sm ring-1 ring-[#4B6BFB]/20"
          : isReached
          ? "bg-white border-[#CBD5E1] hover:border-[#4B6BFB]/60"
          : "bg-[#F8FAFC]/80 border-[#E2E8F0] hover:border-[#CBD5E1]"
      } ${isDimmed ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onClick={() => onSelect(stepId)}
        aria-pressed={isSelected}
        className="w-full text-left flex items-start justify-between gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6BFB]"
      >
        <span className="flex items-start gap-2 min-w-0">
          <span
            className={`mt-0.5 inline-flex items-center justify-center rounded-lg border shrink-0 ${
              compact ? "w-6 h-6" : "w-7 h-7"
            } ${
              isSelected
                ? "bg-[#4B6BFB] text-white border-[#4B6BFB]"
                : isReached
                ? "bg-[#F1F5F9] text-[#0F172A] border-[#CBD5E1]"
                : "bg-white text-[#64748B] border-[#E2E8F0]"
            }`}
          >
            <StepIcon stepId={stepId} className="w-3.5 h-3.5" />
          </span>
          <span className="block min-w-0">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[10px] font-semibold text-[#64748B]">
                {step.code}
              </span>
              <span className="text-xs font-semibold text-[#0F172A] leading-snug">
                {step.shortTitle}
              </span>
            </span>
            <span className="block text-[11px] text-[#475569] leading-relaxed mt-0.5">
              {step.summary}
            </span>
          </span>
        </span>

        {statusTag && (
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap ${toneBadgeClass}`}
          >
            {statusTag}
          </span>
        )}
      </button>
      {children && (
        <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]/80 [&>*:first-child]:mt-0">
          {children}
        </div>
      )}
    </div>
  );
}

function VerticalConnector({
  active = false,
  label,
}: {
  active?: boolean;
  label?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-1 select-none"
      aria-hidden="true"
    >
      <div
        className={`w-px h-3 ${active ? "bg-[#4B6BFB]" : "bg-[#CBD5E1]"}`}
      />
      {label && (
        <span className="text-[10px] font-mono text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-1.5 py-0.5 rounded my-0.5">
          {label}
        </span>
      )}
      <ArrowDown
        className={`w-3.5 h-3.5 -mt-0.5 ${
          active ? "text-[#4B6BFB]" : "text-[#94A3B8]"
        }`}
      />
    </div>
  );
}

function InterPhaseConnector({
  active = false,
  blocked = false,
  label,
}: {
  active?: boolean;
  blocked?: boolean;
  label: string;
}) {
  return (
    <>
      {/* Desktop horizontal arrow bridge */}
      <div
        className="hidden lg:flex flex-col items-center justify-center h-full px-0.5 select-none"
        aria-hidden="true"
      >
        <div
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
            blocked
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : active
              ? "bg-[#4B6BFB] border-[#4B6BFB] text-white shadow-sm"
              : "bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B]"
          }`}
          title={label}
        >
          <ArrowRight className="w-4 h-4" />
        </div>
        <span className="mt-1.5 text-[9.5px] font-mono text-[#64748B] text-center leading-tight">
          {label}
        </span>
      </div>

      {/* Tablet/Mobile vertical arrow bridge */}
      <div
        className="flex lg:hidden items-center justify-center py-1.5 select-none"
        aria-hidden="true"
      >
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium ${
            blocked
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : active
              ? "bg-[#EEF2FF] border-[#4B6BFB]/40 text-[#4B6BFB]"
              : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
          }`}
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
      </div>
    </>
  );
}

export function EmergencyReportingFlow() {
  const [scenarioId, setScenarioId] = useState<FlowScenarioId>("gas-leakage");
  const [sourceMode, setSourceMode] = useState<DetectionSourceMode>("combined");
  const [activePhase, setActivePhase] = useState<FlowPhaseId>("reporting");
  const [selectedStepId, setSelectedStepId] =
    useState<FlowStepId>("iot-sensor");
  const [selectedHierarchyId, setSelectedHierarchyId] =
    useState<HierarchyLevelId>("SCP");
  const [simStage, setSimStage] = useState<SimulationStage>("idle");
  const [verificationOutcome, setVerificationOutcome] =
    useState<VerificationOutcome>("pending");
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const scenario = FLOW_SCENARIOS[scenarioId];
  const stageRank = STAGE_ORDER[simStage];

  // Auto-advance simulation timeline when Simulate Incident is running
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = window.setTimeout(() => {
      if (simStage === "idle") {
        setSimStage("detected");
        setActivePhase("reporting");
        setSelectedStepId(
          sourceMode === "worker-report" ? "worker-report" : "iot-sensor"
        );
      } else if (simStage === "detected") {
        setSimStage("reported");
        setActivePhase("reporting");
        setSelectedStepId("initial-notification");
      } else if (simStage === "reported") {
        setSimStage("verifying");
        setVerificationOutcome("pending");
        setActivePhase("verification");
        setSelectedStepId("field-verification");
      } else if (simStage === "verifying") {
        setVerificationOutcome("confirmed");
        setSimStage("confirmed");
        setActivePhase("verification");
        setSelectedStepId("incident-decision");
      } else if (simStage === "confirmed") {
        setSimStage("activated");
        setActivePhase("activation");
        setSelectedStepId("response-coordination");
        setSelectedHierarchyId("SCP");
      } else {
        setIsAutoPlaying(false);
      }
    }, 1050);

    return () => window.clearTimeout(timer);
  }, [isAutoPlaying, simStage, sourceMode]);

  const handleSelectPhase = (phaseId: FlowPhaseId) => {
    setActivePhase(phaseId);
    const currentStep = FLOW_STEPS.find((s) => s.id === selectedStepId);
    if (!currentStep || currentStep.phase !== phaseId) {
      const firstInPhase = FLOW_STEPS.find((s) => s.phase === phaseId);
      if (firstInPhase) setSelectedStepId(firstInPhase.id);
    }
  };

  const handleSelectStep = (stepId: FlowStepId) => {
    setSelectedStepId(stepId);
    const meta = FLOW_STEPS.find((s) => s.id === stepId);
    if (meta) setActivePhase(meta.phase);
  };

  const handleSimulateIncident = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      return;
    }
    setVerificationOutcome("pending");
    setSimStage("detected");
    setActivePhase("reporting");
    setSelectedStepId(
      sourceMode === "worker-report" ? "worker-report" : "iot-sensor"
    );
    setIsAutoPlaying(true);
  };

  const handleStepForward = () => {
    setIsAutoPlaying(false);
    if (simStage === "idle") {
      setSimStage("detected");
      setActivePhase("reporting");
      setSelectedStepId(
        sourceMode === "worker-report" ? "worker-report" : "iot-sensor"
      );
      return;
    }
    if (simStage === "detected") {
      setSimStage("reported");
      setActivePhase("reporting");
      setSelectedStepId("initial-notification");
      return;
    }
    if (simStage === "reported") {
      setSimStage("verifying");
      setVerificationOutcome("pending");
      setActivePhase("verification");
      setSelectedStepId("field-verification");
      return;
    }
    if (simStage === "verifying") {
      setVerificationOutcome("confirmed");
      setSimStage("confirmed");
      setActivePhase("verification");
      setSelectedStepId("incident-decision");
      return;
    }
    if (simStage === "confirmed") {
      setSimStage("activated");
      setActivePhase("activation");
      setSelectedStepId("response-coordination");
      setSelectedHierarchyId("SCP");
    }
  };

  const handleResetSimulation = () => {
    setIsAutoPlaying(false);
    setSimStage("idle");
    setVerificationOutcome("pending");
    setActivePhase("reporting");
    setSelectedStepId("iot-sensor");
    setSelectedHierarchyId("SCP");
  };

  const handleSelectScenario = (nextId: FlowScenarioId) => {
    setScenarioId(nextId);
  };

  const handleApplyVerificationDecision = (outcome: VerificationOutcome) => {
    setIsAutoPlaying(false);
    setVerificationOutcome(outcome);
    if (outcome === "confirmed") {
      setSimStage((prev) =>
        STAGE_ORDER[prev] >= STAGE_ORDER.confirmed ? prev : "confirmed"
      );
      setActivePhase("verification");
      setSelectedStepId("incident-decision");
    } else {
      setSimStage("verifying");
      setActivePhase("verification");
      setSelectedStepId("incident-decision");
    }
  };

  const handleSelectStatusStep = (
    targetStage: Exclude<SimulationStage, "idle">
  ) => {
    setIsAutoPlaying(false);
    setSimStage(targetStage);
    if (targetStage === "detected" || targetStage === "reported") {
      setVerificationOutcome("pending");
      setActivePhase("reporting");
      setSelectedStepId(
        targetStage === "detected"
          ? sourceMode === "worker-report"
            ? "worker-report"
            : "iot-sensor"
          : "initial-notification"
      );
    } else if (targetStage === "verifying") {
      setVerificationOutcome("pending");
      setActivePhase("verification");
      setSelectedStepId("field-verification");
    } else if (targetStage === "confirmed") {
      setVerificationOutcome("confirmed");
      setActivePhase("verification");
      setSelectedStepId("incident-decision");
    } else {
      setVerificationOutcome("confirmed");
      setActivePhase("activation");
      setSelectedStepId("response-coordination");
    }
  };

  const selectedStep = useMemo(
    () => FLOW_STEPS.find((s) => s.id === selectedStepId) ?? FLOW_STEPS[0],
    [selectedStepId]
  );

  const selectedHierarchyMeta = useMemo(
    () =>
      HIERARCHY_LEVELS.find((h) => h.id === selectedHierarchyId) ??
      HIERARCHY_LEVELS[0],
    [selectedHierarchyId]
  );

  const selectedHierarchyScenarioState =
    scenario.hierarchyPlan[selectedHierarchyId];

  const isPhase3Active =
    stageRank >= STAGE_ORDER.activated && verificationOutcome === "confirmed";
  const isPhase2BlockedByDecision =
    simStage === "verifying" && verificationOutcome === "not-confirmed";

  // Derived readable strings for the 11-field Incident Information Panel
  const incidentStatusLabel = useMemo(() => {
    if (simStage === "idle") return "Baseline / Siap Simulasi";
    if (simStage === "verifying" && verificationOutcome === "not-confirmed") {
      return "Verifying — Not Confirmed (Tinjau / Tutup Laporan)";
    }
    if (simStage === "verifying" && verificationOutcome === "pending") {
      return "Verifying — Pending Additional Check";
    }
    if (simStage === "detected") return "Detected";
    if (simStage === "reported") return "Reported";
    if (simStage === "confirmed") return "Confirmed";
    return "Response Activated";
  }, [simStage, verificationOutcome]);

  const verificationStatusLabel = useMemo(() => {
    if (stageRank < STAGE_ORDER.verifying) return "Belum Diperiksa (Menunggu Tahap Verifikasi)";
    if (verificationOutcome === "confirmed") return "Confirmed (Demo)";
    if (verificationOutcome === "not-confirmed") return "Not Confirmed (Demo)";
    return "Pending (Menunggu Pemeriksaan Lapangan)";
  }, [stageRank, verificationOutcome]);

  const detectionSourceLabel = useMemo(() => {
    if (sourceMode === "iot-sensor") {
      return `${scenario.sensorNodeLabel} (Bukan telemetri nyata)`;
    }
    if (sourceMode === "worker-report") {
      return scenario.workerReportChannelDemo;
    }
    return `${scenario.sensorNodeLabel} + ${scenario.workerReportChannelDemo}`;
  }, [sourceMode, scenario]);

  const assignedCoordinationLabel = useMemo(() => {
    if (stageRank < STAGE_ORDER.confirmed || verificationOutcome !== "confirmed") {
      return verificationOutcome === "not-confirmed" && stageRank >= STAGE_ORDER.verifying
        ? "Tidak Dieskalasi (Laporan ditutup / ditinjau ulang)"
        : "Menunggu Incident Decision (Confirmed)";
    }
    const primaryOrAlerted = HIERARCHY_LEVELS.filter(
      (tier) =>
        scenario.hierarchyPlan[tier.id].activationRole === "Primary (Demo)" ||
        scenario.hierarchyPlan[tier.id].activationRole === "Alerted (Demo)"
    ).map((tier) => `${tier.id} (${scenario.hierarchyPlan[tier.id].activationRole})`);

    return primaryOrAlerted.length > 0
      ? `${primaryOrAlerted.join(" · ")} — Mengacu SOP`
      : "SCP (Site Command Post) — Mengacu SOP";
  }, [stageRank, verificationOutcome, scenario]);

  const activeIncidentIdDisplay =
    simStage === "idle" ? `${scenario.demoIncidentId} (Siap Simulasi)` : scenario.demoIncidentId;

  return (
    <section aria-labelledby="emergency-reporting-flow-heading">
      <Card className="p-5 sm:p-6 space-y-6">
        {/* Section Identity Header */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 pb-5 border-b border-[#F1F5F9]">
          <div className="space-y-2 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral" dot>
                EVORA Incident Management
              </Badge>
              <Badge variant="outline">Conceptual Workflow</Badge>
              <Badge variant="warning">Demonstration Mode · Simulation Data</Badge>
            </div>

            <h2
              id="emergency-reporting-flow-heading"
              className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight"
            >
              Emergency Reporting and Activation Flow
            </h2>

            <p className="text-xs sm:text-sm font-medium text-[#475569]">
              &ldquo;An integrated incident reporting, verification, escalation,
              and emergency response workflow powered by EVORA.&rdquo;
            </p>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Alur ini menggambarkan bagaimana indikasi insiden berasal dari
              sensor simulasi atau laporan pekerja, diperiksa dan
              diklasifikasikan bersama personel berwenang, kemudian diteruskan ke
              tingkat koordinasi relevan untuk mendukung respons darurat dan
              pembaruan rekomendasi evakuasi.
            </p>
          </div>

          {/* Non-Connectivity & Procedural Scope Notice */}
          <div className="xl:max-w-sm rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 text-[11px] text-[#475569] space-y-1.5 shrink-0">
            <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
              <Info className="w-3.5 h-3.5 text-[#4B6BFB]" aria-hidden="true" />
              <span>Batasan Demonstrasi &amp; Dukungan Keputusan</span>
            </div>
            <p className="leading-relaxed">
              Seluruh deteksi, pembacaan sensor, status eskalasi, dan distribusi
              berjalan pada <strong className="text-[#0F172A]">simulasi lokal frontend</strong>.
              Modul ini tidak terhubung langsung dengan telemetri lapangan
              maupun sistem internal Pertamina. EVORA berfungsi sebagai pendukung
              informasi, sedangkan keputusan dan aktivasi final mengikuti SOP
              resmi fasilitas.
            </p>
          </div>
        </div>

        {/* Simulation Controls Bar */}
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Scenario & Detection Source Selectors */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <div className="space-y-1.5">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Incident Scenario (Demo Mode)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(FLOW_SCENARIOS) as FlowScenarioId[]).map(
                    (id) => {
                      const item = FLOW_SCENARIOS[id];
                      const active = scenarioId === id;
                      return (
                        <Button
                          key={id}
                          type="button"
                          size="sm"
                          variant={active ? "primary" : "outline"}
                          onClick={() => handleSelectScenario(id)}
                          aria-pressed={active}
                        >
                          <ScenarioIcon scenarioId={id} />
                          <span>{item.shortTitle}</span>
                        </Button>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Incident Input Source (Demo)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "iot-sensor", label: "IoT Sensor" },
                      { id: "worker-report", label: "Worker Report" },
                      { id: "combined", label: "Sensor + Worker" },
                    ] as const
                  ).map((mode) => (
                    <Button
                      key={mode.id}
                      type="button"
                      size="sm"
                      variant={sourceMode === mode.id ? "default" : "outline"}
                      onClick={() => setSourceMode(mode.id)}
                      aria-pressed={sourceMode === mode.id}
                    >
                      {mode.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulation Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={handleSimulateIncident}
              >
                {isAutoPlaying ? (
                  <>
                    <Square className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Pause Simulation</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Simulate Incident</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleStepForward}
                disabled={simStage === "activated"}
              >
                <StepForward className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Next Stage</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleResetSimulation}
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset Simulation</span>
              </Button>
            </div>
          </div>

          {/* Interactive Status Transition Stepper */}
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Simulation Status Transition (Klik tahapan untuk inspeksi langsung)
              </span>
              <span className="text-xs font-mono text-[#0F172A] font-semibold">
                Status Saat Ini: {incidentStatusLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SIMULATION_STATUS_STEPS.map((st, idx) => {
                const stRank = STAGE_ORDER[st.id];
                const isCurrent = simStage === st.id;
                const isCompleted =
                  stageRank > stRank &&
                  !(
                    verificationOutcome === "not-confirmed" &&
                    stRank >= STAGE_ORDER.confirmed
                  );
                const isBlocked =
                  verificationOutcome === "not-confirmed" &&
                  stRank >= STAGE_ORDER.confirmed &&
                  stageRank >= STAGE_ORDER.verifying;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStatusStep(st.id)}
                    aria-pressed={isCurrent}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6BFB] ${
                      isCurrent
                        ? "bg-[#EEF2FF] border-[#4B6BFB] text-[#0F172A] shadow-sm"
                        : isCompleted
                        ? "bg-emerald-50/70 border-emerald-200 text-[#0F172A]"
                        : isBlocked
                        ? "bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B] opacity-60"
                        : "bg-white border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                        isCurrent
                          ? "bg-[#4B6BFB] text-white"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]"
                      }`}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </span>
                    <span className="block min-w-0">
                      <span className="block text-[11px] font-semibold leading-tight">
                        {st.label}
                      </span>
                      <span className="block text-[10px] text-[#64748B] leading-tight mt-0.5">
                        {st.helper}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Phase Selection Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Pilih Fase Alur">
            {FLOW_PHASES.map((phase) => {
              const isSelected = activePhase === phase.id;
              return (
                <button
                  key={phase.id}
                  type="button"
                  role="tab"
                  aria-label={`${phase.number} ${phase.shortTitle}`}
                  aria-selected={isSelected}
                  onClick={() => handleSelectPhase(phase.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6BFB] ${
                    isSelected
                      ? "bg-[#0F172A] text-white border-[#0F172A] shadow-sm"
                      : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-[#334155] text-white"
                        : "bg-[#F1F5F9] text-[#475569]"
                    }`}
                  >
                    {phase.number}
                  </span>
                  <span>{phase.shortTitle}</span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-[#64748B]">
            Klik node atau fase mana saja untuk melihat input, output, aktor,
            serta aturan proseduralnya.
          </span>
        </div>

        {/* 3-Phase Horizontal Process Diagram (Desktop) -> Stacked Vertical Flow (Tablet/Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)_52px_minmax(0,1fr)] gap-3 lg:gap-1.5 items-stretch">
          {/* ==================== PHASE 1 ==================== */}
          <div
            className={`rounded-2xl border p-4 flex flex-col justify-between transition-colors ${
              activePhase === "reporting"
                ? "bg-white border-[#4B6BFB] ring-1 ring-[#4B6BFB]/20"
                : "bg-[#FAFBFC] border-[#E2E8F0]"
            }`}
          >
            <div className="space-y-3">
              {/* Phase 1 Header */}
              <button
                type="button"
                onClick={() => handleSelectPhase("reporting")}
                className="w-full text-left pb-3 border-b border-[#E2E8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6BFB] rounded-lg block"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4B6BFB] font-mono text-[10px] font-bold uppercase tracking-wider">
                    Phase 1
                  </span>
                  <span className="text-[10px] font-medium text-[#64748B]">
                    {FLOW_PHASES[0].accentLabel}
                  </span>
                </span>
                <span className="block text-sm font-bold text-[#0F172A] mt-1.5">
                  {FLOW_PHASES[0].title}
                </span>
                <span className="block text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                  {FLOW_PHASES[0].subtitle}
                </span>
              </button>

              {/* INCIDENT INPUT Parallel Branches */}
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2 px-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#475569]">
                    INCIDENT INPUT
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    Jalur Simulasi Ganda
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  <DiagramNodeButton
                    stepId="iot-sensor"
                    selectedStepId={selectedStepId}
                    isReached={
                      stageRank >= STAGE_ORDER.detected &&
                      sourceMode !== "worker-report"
                    }
                    isDimmed={sourceMode === "worker-report"}
                    compact
                    statusTag={
                      stageRank >= STAGE_ORDER.detected &&
                      sourceMode !== "worker-report"
                        ? "Demo Trigger"
                        : "Simulasi"
                    }
                    statusTone={
                      stageRank >= STAGE_ORDER.detected &&
                      sourceMode !== "worker-report"
                        ? "critical"
                        : "neutral"
                    }
                    onSelect={handleSelectStep}
                  >
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[10px] text-[#475569]">
                        <Wind className="w-2.5 h-2.5" aria-hidden="true" />
                        Gas
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[10px] text-[#475569]">
                        <Thermometer
                          className="w-2.5 h-2.5"
                          aria-hidden="true"
                        />
                        Temp
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[10px] text-[#475569]">
                        <CloudFog className="w-2.5 h-2.5" aria-hidden="true" />
                        Smoke
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[10px] text-[#475569]">
                        <Flame className="w-2.5 h-2.5" aria-hidden="true" />
                        Flame + Wind
                      </span>
                    </div>
                  </DiagramNodeButton>

                  <DiagramNodeButton
                    stepId="worker-report"
                    selectedStepId={selectedStepId}
                    isReached={
                      stageRank >= STAGE_ORDER.detected &&
                      sourceMode !== "iot-sensor"
                    }
                    isDimmed={sourceMode === "iot-sensor"}
                    compact
                    statusTag={
                      stageRank >= STAGE_ORDER.detected &&
                      sourceMode !== "iot-sensor"
                        ? "Demo Input"
                        : "Konsep / Ref"
                    }
                    statusTone={
                      stageRank >= STAGE_ORDER.detected &&
                      sourceMode !== "iot-sensor"
                        ? "warning"
                        : "neutral"
                    }
                    onSelect={handleSelectStep}
                  >
                    <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-[#475569]">
                      <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9]">
                        Manual Report
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9]">
                        Call Point (Konsep)
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9]">
                        Plant Phone (Ref)
                      </span>
                    </div>
                  </DiagramNodeButton>
                </div>
              </div>

              {/* Dual Branch Merge Connector (1A + 1B -> 1C) */}
              <div
                className="flex flex-col items-center justify-center py-0.5 select-none"
                aria-hidden="true"
              >
                <svg
                  className="hidden sm:block lg:hidden w-full max-w-[220px] h-6"
                  viewBox="0 0 220 24"
                  fill="none"
                >
                  <path
                    d="M55 0 V10 H165 V0"
                    stroke={
                      stageRank >= STAGE_ORDER.detected ? "#4B6BFB" : "#CBD5E1"
                    }
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M110 10 V21"
                    stroke={
                      stageRank >= STAGE_ORDER.detected ? "#4B6BFB" : "#CBD5E1"
                    }
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M105.5 17 L110 22 L114.5 17"
                    stroke={
                      stageRank >= STAGE_ORDER.detected ? "#4B6BFB" : "#94A3B8"
                    }
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="sm:hidden lg:flex">
                  <VerticalConnector active={stageRank >= STAGE_ORDER.detected} />
                </div>
              </div>

              <DiagramNodeButton
                stepId="alert-activation"
                selectedStepId={selectedStepId}
                isReached={stageRank >= STAGE_ORDER.reported}
                statusTag={
                  stageRank >= STAGE_ORDER.reported ? "Detected → Reported" : "Ready"
                }
                statusTone={stageRank >= STAGE_ORDER.reported ? "accent" : "neutral"}
                onSelect={handleSelectStep}
              />

              <VerticalConnector active={stageRank >= STAGE_ORDER.reported} />

              <DiagramNodeButton
                stepId="initial-notification"
                selectedStepId={selectedStepId}
                isReached={stageRank >= STAGE_ORDER.reported}
                statusTag={
                  stageRank >= STAGE_ORDER.reported ? "Reported" : "Standby"
                }
                statusTone={stageRank >= STAGE_ORDER.reported ? "warning" : "neutral"}
                onSelect={handleSelectStep}
              >
                <div className="mt-2 text-[10px] text-[#64748B] border-t border-[#F1F5F9] pt-1.5">
                  Antarmuka EVORA · Radio/telepon hanya kanal prosedural SOP.
                </div>
              </DiagramNodeButton>
            </div>
          </div>

          <InterPhaseConnector
            active={stageRank >= STAGE_ORDER.verifying}
            label="Verifikasi"
          />

          {/* ==================== PHASE 2 ==================== */}
          <div
            className={`rounded-2xl border p-4 flex flex-col justify-between transition-colors ${
              activePhase === "verification"
                ? "bg-white border-[#4B6BFB] ring-1 ring-[#4B6BFB]/20"
                : "bg-[#FAFBFC] border-[#E2E8F0]"
            }`}
          >
            <div className="space-y-2">
              {/* Phase 2 Header */}
              <button
                type="button"
                onClick={() => handleSelectPhase("verification")}
                className="w-full text-left pb-3 border-b border-[#E2E8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6BFB] rounded-lg block"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold uppercase tracking-wider">
                    Phase 2
                  </span>
                  <span className="text-[10px] font-medium text-[#64748B]">
                    {FLOW_PHASES[1].accentLabel}
                  </span>
                </span>
                <span className="block text-sm font-bold text-[#0F172A] mt-1.5">
                  {FLOW_PHASES[1].title}
                </span>
                <span className="block text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                  {FLOW_PHASES[1].subtitle}
                </span>
              </button>

              <div className="pt-1">
                <DiagramNodeButton
                  stepId="field-verification"
                  selectedStepId={selectedStepId}
                  isReached={stageRank >= STAGE_ORDER.verifying}
                  statusTag={
                    stageRank < STAGE_ORDER.verifying
                      ? "Pending"
                      : verificationOutcome === "confirmed"
                      ? "Confirmed"
                      : verificationOutcome === "not-confirmed"
                      ? "Not Confirmed"
                      : "Pending"
                  }
                  statusTone={
                    stageRank < STAGE_ORDER.verifying
                      ? "neutral"
                      : verificationOutcome === "confirmed"
                      ? "safe"
                      : verificationOutcome === "not-confirmed"
                      ? "critical"
                      : "warning"
                  }
                  onSelect={handleSelectStep}
                />
              </div>

              <VerticalConnector active={stageRank >= STAGE_ORDER.verifying} />

              <DiagramNodeButton
                stepId="risk-classification"
                selectedStepId={selectedStepId}
                isReached={stageRank >= STAGE_ORDER.verifying}
                statusTag={
                  stageRank >= STAGE_ORDER.confirmed
                    ? "Reviewed (Demo)"
                    : "Parameter SOP"
                }
                statusTone={stageRank >= STAGE_ORDER.confirmed ? "accent" : "neutral"}
                onSelect={handleSelectStep}
              >
                <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-[#475569]">
                  <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9]">
                    Jenis Bahaya
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9]">
                    Area
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9]">
                    Sensor
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9]">
                    Angin
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9]">
                    Kategori Risiko
                  </span>
                </div>
              </DiagramNodeButton>

              <VerticalConnector active={stageRank >= STAGE_ORDER.verifying} />

              <DiagramNodeButton
                stepId="incident-decision"
                selectedStepId={selectedStepId}
                isReached={stageRank >= STAGE_ORDER.verifying}
                statusTag={
                  verificationOutcome === "confirmed" &&
                  stageRank >= STAGE_ORDER.confirmed
                    ? "Confirmed"
                    : verificationOutcome === "not-confirmed" &&
                      stageRank >= STAGE_ORDER.verifying
                    ? "Not Confirmed"
                    : "Decision Gate"
                }
                statusTone={
                  verificationOutcome === "confirmed" &&
                  stageRank >= STAGE_ORDER.confirmed
                    ? "safe"
                    : verificationOutcome === "not-confirmed" &&
                      stageRank >= STAGE_ORDER.verifying
                    ? "critical"
                    : "warning"
                }
                onSelect={handleSelectStep}
              >
                {/* 3 Explicit Decision Branches */}
                <div className="mt-2.5 space-y-1 text-[10px]">
                  <div
                    className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md border ${
                      verificationOutcome === "pending" &&
                      stageRank >= STAGE_ORDER.verifying
                        ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold"
                        : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                      Pending Verification
                    </span>
                    <span>→ Cek Tambahan</span>
                  </div>
                  <div
                    className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md border ${
                      verificationOutcome === "not-confirmed" &&
                      stageRank >= STAGE_ORDER.verifying
                        ? "bg-red-50 border-red-300 text-red-900 font-semibold"
                        : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                      Not Confirmed
                    </span>
                    <span>→ Review / Tutup</span>
                  </div>
                  <div
                    className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md border ${
                      verificationOutcome === "confirmed" &&
                      stageRank >= STAGE_ORDER.confirmed
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                        : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <CheckCircle2
                        className="w-3 h-3 shrink-0"
                        aria-hidden="true"
                      />
                      Confirmed Incident
                    </span>
                    <span>→ Aktivasi Respons</span>
                  </div>
                </div>
              </DiagramNodeButton>

              {/* Interactive Demo Verification Decision Controls */}
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Demo Decision Action
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    Pendukung Keputusan
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyVerificationDecision("confirmed")}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                      verificationOutcome === "confirmed" &&
                      stageRank >= STAGE_ORDER.confirmed
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-emerald-700 border-[#CBD5E1] hover:bg-emerald-50"
                    }`}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyVerificationDecision("pending")}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                      verificationOutcome === "pending" &&
                      stageRank === STAGE_ORDER.verifying
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white text-amber-700 border-[#CBD5E1] hover:bg-amber-50"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyVerificationDecision("not-confirmed")
                    }
                    className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                      verificationOutcome === "not-confirmed" &&
                      stageRank >= STAGE_ORDER.verifying
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-white text-red-700 border-[#CBD5E1] hover:bg-red-50"
                    }`}
                  >
                    Not Confirmed
                  </button>
                </div>
              </div>
            </div>
          </div>

          <InterPhaseConnector
            active={
              stageRank >= STAGE_ORDER.confirmed &&
              verificationOutcome === "confirmed"
            }
            blocked={isPhase2BlockedByDecision}
            label={isPhase2BlockedByDecision ? "Tertahan" : "Aktivasi"}
          />

          {/* ==================== PHASE 3 ==================== */}
          <div
            className={`rounded-2xl border p-4 flex flex-col justify-between transition-colors ${
              activePhase === "activation"
                ? "bg-white border-[#4B6BFB] ring-1 ring-[#4B6BFB]/20"
                : "bg-[#FAFBFC] border-[#E2E8F0]"
            } ${isPhase2BlockedByDecision ? "opacity-65" : ""}`}
          >
            <div className="space-y-2">
              {/* Phase 3 Header */}
              <button
                type="button"
                onClick={() => handleSelectPhase("activation")}
                className="w-full text-left pb-3 border-b border-[#E2E8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6BFB] rounded-lg block"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold uppercase tracking-wider">
                    Phase 3
                  </span>
                  <span className="text-[10px] font-medium text-[#64748B]">
                    {FLOW_PHASES[2].accentLabel}
                  </span>
                </span>
                <span className="block text-sm font-bold text-[#0F172A] mt-1.5">
                  {FLOW_PHASES[2].title}
                </span>
                <span className="block text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                  {FLOW_PHASES[2].subtitle}
                </span>
              </button>

              <div className="pt-1">
                <DiagramNodeButton
                  stepId="response-coordination"
                  selectedStepId={selectedStepId}
                  isReached={isPhase3Active}
                  isDimmed={isPhase2BlockedByDecision}
                  statusTag={isPhase3Active ? "Activated" : "Menunggu Confirmed"}
                  statusTone={isPhase3Active ? "safe" : "neutral"}
                  onSelect={handleSelectStep}
                >
                  {/* Clickable 5-Tier Hierarchy Pills inside Flow */}
                  <div className="mt-2.5 space-y-1">
                    {HIERARCHY_LEVELS.map((tier) => {
                      const tierPlan = scenario.hierarchyPlan[tier.id];
                      const tierSelected = selectedHierarchyId === tier.id;
                      const tierPrimary =
                        tierPlan.activationRole === "Primary (Demo)";
                      const tierAlerted =
                        tierPlan.activationRole === "Alerted (Demo)";

                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            setSelectedHierarchyId(tier.id);
                            handleSelectStep("response-coordination");
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg border text-[10px] transition-colors ${
                            tierSelected
                              ? "bg-[#EEF2FF] border-[#4B6BFB] text-[#0F172A] font-semibold"
                              : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1]"
                          }`}
                        >
                          <span className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono font-bold text-[#0F172A]">
                              {tier.id}
                            </span>
                            <span className="truncate">
                              — {tier.scopeLabel}
                            </span>
                          </span>
                          <span
                            className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              isPhase3Active && tierPrimary
                                ? "bg-emerald-100 text-emerald-800"
                                : isPhase3Active && tierAlerted
                                ? "bg-amber-100 text-amber-800"
                                : "bg-white text-[#64748B] border border-[#E2E8F0]"
                            }`}
                          >
                            {isPhase3Active
                              ? tierPlan.activationRole.replace(" (Demo)", "")
                              : "Ref"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </DiagramNodeButton>
              </div>

              <VerticalConnector active={isPhase3Active} />

              <DiagramNodeButton
                stepId="info-update"
                selectedStepId={selectedStepId}
                isReached={isPhase3Active}
                isDimmed={isPhase2BlockedByDecision}
                statusTag={isPhase3Active ? "Route Updated" : "Standby"}
                statusTone={isPhase3Active ? "accent" : "neutral"}
                onSelect={handleSelectStep}
              >
                <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    Available
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                    Caution
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium">
                    Blocked
                  </span>
                </div>
              </DiagramNodeButton>

              <VerticalConnector active={isPhase3Active} />

              <DiagramNodeButton
                stepId="info-distribution"
                selectedStepId={selectedStepId}
                isReached={isPhase3Active}
                isDimmed={isPhase2BlockedByDecision}
                statusTag={isPhase3Active ? "Distributed (Demo)" : "Mockup"}
                statusTone={isPhase3Active ? "safe" : "neutral"}
                onSelect={handleSelectStep}
              >
                <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-[#475569]">
                  <span className="px-1.5 py-1 rounded bg-[#F1F5F9] text-center truncate">
                    Dashboard
                  </span>
                  <span className="px-1.5 py-1 rounded bg-[#F1F5F9] text-center truncate">
                    Mobile App
                  </span>
                  <span className="px-1.5 py-1 rounded bg-[#F1F5F9] text-center truncate">
                    Signage
                  </span>
                </div>
              </DiagramNodeButton>
            </div>
          </div>
        </div>

        {/* Interactive Details + Live Incident Info Panel Split */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left 7 Columns: Step Detail Inspector + Coordination Hierarchy Inspector */}
          <div className="xl:col-span-7 space-y-5 min-w-0">
            {/* Selected Workflow Step Detail Panel */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4B6BFB] border border-[#4B6BFB]/20 shrink-0">
                    <StepIcon stepId={selectedStep.id} className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#4B6BFB]">
                        Step {selectedStep.code}
                      </span>
                      <span className="text-[#CBD5E1]">·</span>
                      <span className="text-[11px] font-medium text-[#64748B]">
                        {
                          FLOW_PHASES.find((p) => p.id === selectedStep.phase)
                            ?.title
                        }
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                      {selectedStep.title}
                    </h3>
                  </div>
                </div>
                <Badge variant="outline">Detail Tahapan</Badge>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed">
                {selectedStep.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0F172A]">
                    Input Tahapan
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#475569]">
                    {selectedStep.inputs.map((inp) => (
                      <li key={inp} className="flex items-start gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#4B6BFB] mt-1.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0F172A]">
                    Output Tahapan
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#475569]">
                    {selectedStep.outputs.map((outp) => (
                      <li key={outp} className="flex items-start gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{outp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#F1F5F9]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F172A] mr-1">
                    <Users className="w-3.5 h-3.5 text-[#64748B]" aria-hidden="true" />
                    Aktor / Peran:
                  </span>
                  {selectedStep.actors.map((actor) => (
                    <span
                      key={actor}
                      className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-medium text-[#475569]"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2.5 text-[11px] text-[#64748B] flex items-start gap-2">
                <ShieldCheck
                  className="w-3.5 h-3.5 text-[#475569] mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{selectedStep.disclaimerNote}</span>
              </div>
            </div>

            {/* Interactive Coordination Hierarchy Explorer (SCP / ICC / BSC / CMC / EST) */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <Layers
                    className="w-4 h-4 text-[#475569]"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                      Coordination &amp; Escalation Structure (SCP — EST)
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Klik tingkatan struktur koordinasi referensi EVORA untuk
                      melihat ringkasan perannya.
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Referensi SOP</Badge>
              </div>

              {/* 5-Tier Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {HIERARCHY_LEVELS.map((tier) => {
                  const active = selectedHierarchyId === tier.id;
                  const plan = scenario.hierarchyPlan[tier.id];
                  const isTierInvolved =
                    isPhase3Active &&
                    (plan.activationRole === "Primary (Demo)" ||
                      plan.activationRole === "Alerted (Demo)");

                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedHierarchyId(tier.id)}
                      aria-pressed={active}
                      className={`rounded-xl border p-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6BFB] ${
                        active
                          ? "bg-[#EEF2FF] border-[#4B6BFB] ring-1 ring-[#4B6BFB]/20"
                          : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-bold text-[#0F172A]">
                          {tier.order}. {tier.id}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isPhase3Active &&
                            plan.activationRole === "Primary (Demo)"
                              ? "bg-emerald-500"
                              : isTierInvolved
                              ? "bg-amber-500"
                              : "bg-[#CBD5E1]"
                          }`}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="block text-[10px] text-[#64748B] truncate mt-1">
                        {tier.scopeLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Hierarchy Detail Box */}
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">
                      {selectedHierarchyMeta.order}.{" "}
                      {selectedHierarchyMeta.name}
                    </div>
                    <div className="text-[11px] text-[#475569] mt-0.5">
                      {selectedHierarchyMeta.roleSummary}
                    </div>
                  </div>
                  <Badge
                    variant={
                      isPhase3Active &&
                      selectedHierarchyScenarioState.activationRole ===
                        "Primary (Demo)"
                        ? "safe"
                        : isPhase3Active &&
                          selectedHierarchyScenarioState.activationRole ===
                            "Alerted (Demo)"
                        ? "warning"
                        : "neutral"
                    }
                    dot
                  >
                    {isPhase3Active
                      ? selectedHierarchyScenarioState.acknowledgmentStatus
                      : "Standby (Demo)"}
                  </Badge>
                </div>

                <ul className="space-y-1.5 text-xs text-[#475569]">
                  {selectedHierarchyMeta.coordinationFocus.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#4B6BFB] mt-1.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1">
                  <div>
                    <strong className="text-[#0F172A]">
                      Status Skenario ({scenario.shortTitle}):
                    </strong>{" "}
                    {selectedHierarchyScenarioState.note}
                  </div>
                  <div>
                    Eskalasi bergantung pada tingkat keparahan dan prosedur
                    resmi, tidak selalu mengaktifkan seluruh level secara
                    berurutan. {selectedHierarchyMeta.proceduralNote}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Live Incident Information Panel (All 11 Spec Fields) */}
          <div className="xl:col-span-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 space-y-4 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Compass
                  className="w-4 h-4 text-[#475569]"
                  aria-hidden="true"
                />
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                  Incident Information Panel
                </h3>
              </div>
              <Badge variant="warning" dot>
                Simulation Data
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2.5 text-xs">
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 flex items-center justify-between gap-2">
                <span className="text-[#64748B]">Incident ID (Demo)</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  {activeIncidentIdDisplay}
                </span>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                <div className="text-[#64748B]">Incident Type</div>
                <div className="font-semibold text-[#0F172A] mt-0.5">
                  {scenario.hazardTypeLabel}
                </div>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                <div className="text-[#64748B]">Location / Facility Area</div>
                <div className="font-semibold text-[#0F172A] mt-0.5">
                  {scenario.area}
                </div>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                <div className="text-[#64748B]">Detection Source</div>
                <div className="font-medium text-[#0F172A] mt-0.5">
                  {detectionSourceLabel}
                </div>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 flex items-center justify-between gap-2">
                <span className="text-[#64748B]">Detection Time</span>
                <span className="font-mono font-semibold text-[#0F172A]">
                  {scenario.simTimeLabel}
                </span>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                <div className="text-[#64748B]">
                  Sensor Readings &amp; Environmental Context (Simulasi)
                </div>
                <div className="font-medium text-[#0F172A] mt-0.5">
                  {stageRank >= STAGE_ORDER.detected
                    ? scenario.sensorReadingDemo
                    : "Baseline normal (Simulasi belum mendeteksi anomali)"}
                </div>
                <div className="text-[11px] text-[#64748B] mt-1">
                  {scenario.environmentalCondition}
                </div>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 flex items-center justify-between gap-2">
                <span className="text-[#64748B]">Verification Status</span>
                <span className="font-semibold text-[#0F172A] text-right">
                  {verificationStatusLabel}
                </span>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                <div className="text-[#64748B]">Risk Category</div>
                <div className="font-medium text-[#0F172A] mt-0.5">
                  {stageRank >= STAGE_ORDER.confirmed &&
                  verificationOutcome === "confirmed"
                    ? scenario.riskCategoryDemo
                    : "Menunggu konfirmasi verifikasi & kajian SOP fasilitas"}
                </div>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 flex items-center justify-between gap-2">
                <span className="text-[#64748B]">Incident Status</span>
                <span className="font-mono font-bold text-[#4B6BFB] text-right">
                  {incidentStatusLabel}
                </span>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                <div className="text-[#64748B]">Assigned Coordination Level</div>
                <div className="font-medium text-[#0F172A] mt-0.5">
                  {assignedCoordinationLabel}
                </div>
              </div>

              <div
                className={`rounded-xl border p-3 ${
                  isPhase3Active
                    ? "bg-emerald-50/70 border-emerald-200"
                    : "bg-[#F8FAFC] border-[#E2E8F0]"
                }`}
              >
                <div className="text-[#64748B]">
                  Recommended Action / Evacuation Information
                </div>
                <div className="font-medium text-[#0F172A] mt-0.5 leading-relaxed">
                  {isPhase3Active
                    ? scenario.recommendedAction
                    : "Rekomendasi evakuasi final akan diperbarui setelah status mencapai Response Activated."}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#64748B] pt-1 border-t border-[#F1F5F9]">
              Privasi terjaga: tidak ada data pribadi pekerja; identifikasi hanya
              menggunakan peran (Role) atau ID simulasi demonstrasi.
            </div>
          </div>
        </div>

        {/* Phase 3 Output: EVORA Information Update & Distribution Channels */}
        <div className="space-y-3 pt-2 border-t border-[#F1F5F9]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                EVORA Information Update &amp; Emergency Information Distribution
              </h3>
              <p className="text-xs text-[#64748B]">
                Pembaruan status rute (Available / Caution / Blocked) dan mockup
                media distribusi informasi demonstrasi.
              </p>
            </div>
            <Badge variant={isPhase3Active ? "safe" : "neutral"} dot>
              {isPhase3Active
                ? "Informasi Evakuasi Terbarui (Demo)"
                : "Menunggu Response Activation"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 1. EVORA Dashboard & Route Status Update */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                    <Monitor
                      className="w-4 h-4 text-[#4B6BFB]"
                      aria-hidden="true"
                    />
                    <span>EVORA Dashboard</span>
                  </div>
                  <Badge variant="outline">Operator UI</Badge>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed bg-white border border-[#E2E8F0] rounded-xl p-3">
                  {isPhase3Active
                    ? scenario.dashboardDispatchSummary
                    : "Pada kondisi awal/verifikasi, dashboard menampilkan status pelaporan awal hingga konfirmasi keputusan diterima."}
                </p>

                {/* Explicit EVORA Information Update Snapshot (Phase 3.B) */}
                <div className="rounded-xl bg-white border border-[#E2E8F0] p-3 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#64748B]">Incident Status:</span>
                    <span className="font-mono font-semibold text-[#0F172A]">
                      {incidentStatusLabel}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Hazard Area / Zone: </span>
                    <span className="font-medium text-[#0F172A]">
                      {isPhase3Active
                        ? scenario.affectedZoneSummary
                        : `${scenario.area} (Baseline demonstrasi)`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Risk Classification: </span>
                    <span className="font-medium text-[#0F172A]">
                      {stageRank >= STAGE_ORDER.confirmed &&
                      verificationOutcome === "confirmed"
                        ? scenario.riskCategoryDemo
                        : "Belum ditetapkan (mengacu kajian & SOP fasilitas)"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-[#0F172A]">
                    Status Rute Evakuasi (Simulasi)
                  </div>
                  {scenario.routes.map((rt) => {
                    const effectiveStatus: FlowRouteStatus = isPhase3Active
                      ? rt.status
                      : "Available";
                    return (
                      <div
                        key={rt.routeCode}
                        className="rounded-xl bg-white border border-[#E2E8F0] px-3 py-2 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#0F172A]">
                            {rt.routeCode} · {rt.routeName}
                          </span>
                          <Badge variant={getRouteBadgeVariant(effectiveStatus)}>
                            {effectiveStatus}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {isPhase3Active
                            ? `${rt.destination} — ${rt.note}`
                            : `${rt.destination} (Kondisi baseline demonstrasi)`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[11px] text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                {scenario.sensorHealthSummary}
              </div>
            </div>

            {/* 2. Mobile Notification Mockup (jika fitur tersedia) */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                    <Smartphone
                      className="w-4 h-4 text-[#4B6BFB]"
                      aria-hidden="true"
                    />
                    <span>Mobile Notification</span>
                  </div>
                  <Badge variant="outline">Jika Fitur Tersedia</Badge>
                </div>

                <div className="rounded-2xl bg-white border border-[#CBD5E1] p-3.5 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-[#64748B]">
                    <span>EVORA MOBILE · DEMO MOCKUP</span>
                    <span>{scenario.simTimeLabel.split(" ")[0]} WIB</span>
                  </div>

                  {isPhase3Active ? (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-[#0F172A]">
                            {scenario.mobileTitle}
                          </div>
                          <p className="text-xs text-[#475569] leading-relaxed mt-1">
                            {scenario.mobileBody}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800">
                        Rute Rekomendasi: {scenario.signageSafeTarget}
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center space-y-1">
                      <div className="text-xs font-semibold text-[#0F172A]">
                        Belum Ada Notifikasi Evakuasi Aktif
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Jalankan simulasi hingga Response Activated untuk
                        melihat pratinjau notifikasi pekerja terdaftar.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                Ditujukan bagi pekerja / pengguna terdaftar apabila fitur
                notifikasi mobile diimplementasikan (saat ini mockup demo).
              </div>
            </div>

            {/* 3. Dynamic Evacuation Signage Mockup (Rancangan Media) */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                    <Navigation
                      className="w-4 h-4 text-[#4B6BFB]"
                      aria-hidden="true"
                    />
                    <span>Dynamic Evacuation Signage</span>
                  </div>
                  <Badge variant="outline">Rancangan Konsep</Badge>
                </div>

                {/* High-contrast field LED signage preview frame */}
                <div className="rounded-2xl bg-[#0F172A] text-white border border-[#334155] p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-slate-300">
                    <span>{scenario.primarySignageNode}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        isPhase3Active
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {isPhase3Active ? "UPDATED (DEMO)" : "STANDBY (DEMO)"}
                    </span>
                  </div>

                  {isPhase3Active ? (
                    <>
                      <div className="text-[11px] font-mono font-semibold text-amber-300">
                        {scenario.signageWarningLine}
                      </div>
                      <div className="text-sm font-bold tracking-tight text-white">
                        {scenario.signageDirectionLabel}
                      </div>
                      <div className="text-xs text-emerald-300 font-medium">
                        {scenario.signageSafeTarget}
                      </div>
                    </>
                  ) : (
                    <div className="py-2 space-y-1">
                      <div className="text-sm font-semibold text-slate-100">
                        NORMAL WAYFINDING (DEMO)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Menampilkan arah evakuasi standar hingga status
                        Response Activated terpicu pada simulasi.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-white border border-[#E2E8F0] px-3 py-2 text-[11px] text-[#475569]">
                <strong className="text-[#0F172A]">
                  Kanal Resmi Prosedural:
                </strong>{" "}
                Radio lapangan, plant phone, dan PAGA fasilitas tetap mengikuti
                SOP komunikasi darurat resmi dan tidak diklaim terintegrasi
                otomatis.
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
