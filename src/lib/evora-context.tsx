"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  EvacuationRoute,
  FacilityAsset,
  FacilityInfo,
  HazardZone,
  RouteScoringConfig,
  SafetyAlert,
  Sensor,
  SimulatedIncident,
  SimulationScenario,
  TimelineEvent,
  UIViewState,
  WorkerAgent,
} from "@/types/evora";
import {
  FACILITIES,
  FACILITY_ASSETS,
  INITIAL_ALERTS,
  INITIAL_TIMELINE_EVENTS,
} from "@/data/facilities";
import { INITIAL_SENSORS } from "@/data/sensors";
import { INITIAL_HAZARDS } from "@/data/hazards";
import { INITIAL_ROUTES } from "@/data/routes";
import { INITIAL_WORKERS } from "@/data/workers";
import {
  SIMULATED_INCIDENTS,
  SIMULATION_SCENARIOS,
} from "@/data/scenarios";
import {
  DEFAULT_SCORING_CONFIG,
  evaluateFacilityRoutes,
} from "@/lib/route-scoring";

export interface ToastMessage {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "success" | "warning" | "danger";
}

interface EvoraContextValue {
  facilities: FacilityInfo[];
  selectedFacilityId: string;
  currentFacility: FacilityInfo;
  setSelectedFacilityId: (id: string) => void;
  uiState: UIViewState;
  setUiState: (state: UIViewState) => void;
  assets: FacilityAsset[];
  sensors: Sensor[];
  hazards: HazardZone[];
  routes: EvacuationRoute[];
  workers: WorkerAgent[];
  alerts: SafetyAlert[];
  timelineEvents: TimelineEvent[];
  scenarios: SimulationScenario[];
  incidents: SimulatedIncident[];
  scoringConfig: RouteScoringConfig;
  hazardExpansionStep: number;
  lastUpdatedTimestamp: string;
  toasts: ToastMessage[];
  pushToast: (
    title: string,
    detail: string,
    tone?: ToastMessage["tone"]
  ) => void;
  dismissToast: (id: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  triggerHazardExpansion: () => void;
  resetDemoState: () => void;
  updateScoringConfig: (partial: Partial<RouteScoringConfig>) => void;
  recalculateRoutesNow: () => void;
  toggleRouteAccessibility: (routeId: string) => void;
  toggleSensorFault: (sensorId: string) => void;
  triggerSensorSpike: (sensorId: string) => void;
  updateSensorThresholds: (
    sensorId: string,
    warningThreshold: number,
    criticalThreshold: number
  ) => void;
  applyScenarioPreset: (scenarioId: string) => void;
}

const EvoraContext = createContext<EvoraContextValue | null>(null);

export function EvoraProvider({ children }: { children: React.ReactNode }) {
  const [selectedFacilityId, setSelectedFacilityIdState] =
    useState<string>("depot-alpha");
  const [uiState, setUiState] = useState<UIViewState>("ready");
  const [allSensors, setAllSensors] = useState<Sensor[]>(INITIAL_SENSORS);
  const [allHazards, setAllHazards] = useState<HazardZone[]>(INITIAL_HAZARDS);
  const [baseRoutes, setBaseRoutes] =
    useState<EvacuationRoute[]>(INITIAL_ROUTES);
  const [allWorkers, setAllWorkers] =
    useState<WorkerAgent[]>(INITIAL_WORKERS);
  const [allAlerts, setAllAlerts] = useState<SafetyAlert[]>(INITIAL_ALERTS);
  const [allTimeline, setAllTimeline] = useState<TimelineEvent[]>(
    INITIAL_TIMELINE_EVENTS
  );
  const [scoringConfig, setScoringConfig] = useState<RouteScoringConfig>(
    DEFAULT_SCORING_CONFIG
  );
  const [hazardExpansionStep, setHazardExpansionStep] = useState<number>(0);
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] =
    useState<string>("09:51:04 WIB");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Ensure HMR updates to static coordinates/waypoints immediately reflect in active state
  useEffect(() => {
    setAllSensors((prev) =>
      prev.map((s) => {
        const init = INITIAL_SENSORS.find((i) => i.id === s.id);
        return init ? { ...s, x: init.x, y: init.y } : s;
      })
    );
    setAllHazards((prev) =>
      prev.map((h) => {
        const init = INITIAL_HAZARDS.find((i) => i.id === h.id);
        return init
          ? {
              ...h,
              x: init.x,
              y: init.y,
              baseRadius: init.baseRadius,
              expandedRadius: init.expandedRadius,
              radius: h.radius > init.baseRadius ? init.expandedRadius : init.baseRadius,
            }
          : h;
      })
    );
    setBaseRoutes((prev) =>
      prev.map((r) => {
        const init = INITIAL_ROUTES.find((i) => i.id === r.id);
        return init ? { ...r, waypoints: init.waypoints } : r;
      })
    );
    setAllWorkers((prev) =>
      prev.map((w) => {
        const init = INITIAL_WORKERS.find((i) => i.id === w.id);
        return init
          ? {
              ...w,
              x: init.x,
              y: init.y,
              originX: init.originX,
              originY: init.originY,
            }
          : w;
      })
    );
  }, []);

  const pushToast = useCallback(
    (
      title: string,
      detail: string,
      tone: ToastMessage["tone"] = "info"
    ) => {
      const id = `tst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, detail, tone }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const appendTimelineEvent = useCallback(
    (
      facilityId: string,
      category: TimelineEvent["category"],
      title: string,
      detail: string
    ) => {
      const nowStr = new Date().toTimeString().slice(0, 8);
      setLastUpdatedTimestamp(`${nowStr} WIB`);
      setAllTimeline((prev) => [
        {
          id: `EVT-${Date.now().toString().slice(-4)}`,
          facilityId,
          timestamp: nowStr,
          category,
          title,
          detail,
        },
        ...prev,
      ]);
    },
    []
  );

  const evaluatedRoutes = useMemo(
    () => evaluateFacilityRoutes(baseRoutes, allHazards, scoringConfig),
    [baseRoutes, allHazards, scoringConfig]
  );

  const currentFacility = useMemo(
    () =>
      FACILITIES.find((f) => f.id === selectedFacilityId) ?? FACILITIES[0],
    [selectedFacilityId]
  );

  const assets = useMemo(
    () => FACILITY_ASSETS.filter((a) => a.facilityId === selectedFacilityId),
    [selectedFacilityId]
  );

  const sensors = useMemo(
    () => allSensors.filter((s) => s.facilityId === selectedFacilityId),
    [allSensors, selectedFacilityId]
  );

  const hazards = useMemo(
    () => allHazards.filter((h) => h.facilityId === selectedFacilityId),
    [allHazards, selectedFacilityId]
  );

  const routes = useMemo(
    () => evaluatedRoutes.filter((r) => r.facilityId === selectedFacilityId),
    [evaluatedRoutes, selectedFacilityId]
  );

  const workers = useMemo(
    () => allWorkers.filter((w) => w.facilityId === selectedFacilityId),
    [allWorkers, selectedFacilityId]
  );

  const alerts = useMemo(
    () => allAlerts.filter((a) => a.facilityId === selectedFacilityId),
    [allAlerts, selectedFacilityId]
  );

  const timelineEvents = useMemo(
    () => allTimeline.filter((e) => e.facilityId === selectedFacilityId),
    [allTimeline, selectedFacilityId]
  );

  const incidents = useMemo(
    () =>
      SIMULATED_INCIDENTS.filter((inc) => inc.facilityId === selectedFacilityId),
    [selectedFacilityId]
  );

  const setSelectedFacilityId = useCallback(
    (id: string) => {
      setSelectedFacilityIdState(id);
      const target = FACILITIES.find((f) => f.id === id);
      if (target) {
        pushToast(
          `Switched to ${target.code}`,
          `Loaded synthetic dataset for ${target.name}.`,
          "info"
        );
      }
    },
    [pushToast]
  );

  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      const target = allAlerts.find((a) => a.id === alertId);
      if (!target || target.acknowledged) return;
      setAllAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
      );
      appendTimelineEvent(
        target.facilityId,
        "operator",
        `Alert ${alertId} Acknowledged by HSE Operator`,
        `Operator verified "${target.title}" at ${target.location}.`
      );
      pushToast(
        `Alert ${alertId} Acknowledged`,
        "Recorded operator acknowledgement in the facility activity timeline.",
        "success"
      );
    },
    [allAlerts, appendTimelineEvent, pushToast]
  );

  const triggerHazardExpansion = useCallback(() => {
    setHazardExpansionStep((prev) => {
      const nextStep = prev === 0 ? 1 : prev === 1 ? 2 : 1;

      if (selectedFacilityId === "depot-alpha") {
        setAllHazards((hPrev) =>
          hPrev.map((h) => {
            if (h.id === "HAZ-WEST-EXP") {
              return {
                ...h,
                active: true,
                radius: nextStep === 1 ? 98 : 118,
                severity: "critical",
              };
            }
            if (h.id === "HAZ-GAS-01") {
              return {
                ...h,
                radius: nextStep === 1 ? 104 : 124,
                severity: "critical",
              };
            }
            if (h.id === "HAZ-FIRE-01") {
              return {
                ...h,
                radius: nextStep === 1 ? 82 : 98,
                severity: "critical",
              };
            }
            return h;
          })
        );

        setAllSensors((sPrev) =>
          sPrev.map((s) => {
            if (s.id === "SNS-GAS-01") {
              const newVal = nextStep === 1 ? 58.0 : 66.4;
              return {
                ...s,
                value: newVal,
                status: "critical",
                lastUpdated: "09:53:40",
                history: [...s.history.slice(1), { time: "09:53", value: newVal }],
              };
            }
            if (s.id === "SNS-GAS-02") {
              const newVal = nextStep === 1 ? 61.5 : 70.2;
              return {
                ...s,
                value: newVal,
                status: "critical",
                lastUpdated: "09:53:40",
                history: [...s.history.slice(1), { time: "09:53", value: newVal }],
              };
            }
            return s;
          })
        );

        setAllWorkers((wPrev) =>
          wPrev.map((w) =>
            w.facilityId === "depot-alpha" && w.assignedRouteId === "RT-ALPHA-A"
              ? { ...w, assignedRouteId: "RT-ALPHA-B" }
              : w
          )
        );

        appendTimelineEvent(
          "depot-alpha",
          "evacuation",
          "Hazard Expansion Detected: Route A Blocked -> Route B Recommended",
          "Westward hydrocarbon plume (58.0% LEL) crossed North-West Service Road. Route A risk score exceeded threshold (65). Dynamic Signage switched to Route B (South Perimeter Bypass)."
        );

        pushToast(
          "Route Reassessment Triggered: Route A Blocked",
          "Westward vapor plume exceeded risk threshold on Route A. EVORA now recommends Route B (South Perimeter Bypass).",
          "danger"
        );
      } else {
        // Depot Beta expansion
        setAllHazards((hPrev) =>
          hPrev.map((h) =>
            h.id === "HAZ-B-GAS-01"
              ? { ...h, x: 240, y: 290, radius: 115, severity: "critical" }
              : h
          )
        );
        appendTimelineEvent(
          "depot-beta",
          "evacuation",
          "Depot Beta Plume Shift: Route Beta-1 Blocked -> Route Beta-2 Recommended",
          "Thermal & vapor zone shifted west; signage redirected workers to Route Beta-2 (South Gate Access Road)."
        );
        pushToast(
          "Depot Beta Route Reassessed",
          "Route Beta-1 blocked due to westward hazard shift. Route Beta-2 is now recommended.",
          "warning"
        );
      }

      return nextStep;
    });
  }, [appendTimelineEvent, pushToast, selectedFacilityId]);

  const resetDemoState = useCallback(() => {
    setAllSensors(INITIAL_SENSORS);
    setAllHazards(INITIAL_HAZARDS);
    setBaseRoutes(INITIAL_ROUTES);
    setAllWorkers(INITIAL_WORKERS);
    setAllAlerts(INITIAL_ALERTS);
    setScoringConfig(DEFAULT_SCORING_CONFIG);
    setHazardExpansionStep(0);
    setUiState("ready");
    appendTimelineEvent(
      selectedFacilityId,
      "operator",
      "Simulation Baseline Restored",
      "Operator reset hazard overlays, sensor telemetry, and route weights to initial baseline state (Route A recommended)."
    );
    pushToast(
      "Baseline Demo State Restored",
      "Route A is recommended again. Ready to run the hazard expansion demonstration.",
      "info"
    );
  }, [appendTimelineEvent, pushToast, selectedFacilityId]);

  const updateScoringConfig = useCallback(
    (partial: Partial<RouteScoringConfig>) => {
      setScoringConfig((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const recalculateRoutesNow = useCallback(() => {
    appendTimelineEvent(
      selectedFacilityId,
      "evacuation",
      "Manual Route Recalculation Executed",
      `Evaluated candidate routes using threshold ${scoringConfig.riskThreshold}/100 and current multi-hazard telemetry.`
    );
    pushToast(
      "Routes Recalculated",
      `Updated candidate route rankings against risk threshold (${scoringConfig.riskThreshold}/100).`,
      "success"
    );
  }, [appendTimelineEvent, pushToast, scoringConfig.riskThreshold, selectedFacilityId]);

  const toggleRouteAccessibility = useCallback(
    (routeId: string) => {
      const target = baseRoutes.find((r) => r.id === routeId);
      if (!target) return;
      const nextAcc = !target.accessible;
      setBaseRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                accessible: nextAcc,
                accessibilityNote: nextAcc
                  ? "Corridor clearance restored and verified by HSE operator."
                  : "Corridor manually marked obstructed (physical barrier / emergency valve closure).",
              }
            : r
        )
      );
      appendTimelineEvent(
        target.facilityId,
        "evacuation",
        `Corridor Accessibility Updated (${target.shortCode})`,
        `${target.name} marked as ${nextAcc ? "Accessible" : "Obstructed / Inaccessible"}.`
      );
      pushToast(
        `${target.shortCode} ${nextAcc ? "Accessible" : "Marked Inaccessible"}`,
        nextAcc
          ? "Corridor re-entered candidate pool for route scoring."
          : "Inaccessible corridors are automatically excluded from EVORA recommendations.",
        nextAcc ? "success" : "warning"
      );
    },
    [appendTimelineEvent, baseRoutes, pushToast]
  );

  const toggleSensorFault = useCallback(
    (sensorId: string) => {
      const target = allSensors.find((s) => s.id === sensorId);
      if (!target) return;
      const nextOffline = target.status !== "offline";
      setAllSensors((prev) =>
        prev.map((s) => {
          if (s.id !== sensorId) return s;
          if (nextOffline) {
            return { ...s, status: "offline", lastUpdated: "Offline (Simulated Fault)" };
          }
          const restoredStatus =
            s.value >= s.criticalThreshold
              ? "critical"
              : s.value >= s.warningThreshold
              ? "warning"
              : "normal";
          return { ...s, status: restoredStatus, lastUpdated: "09:54:10" };
        })
      );
      appendTimelineEvent(
        target.facilityId,
        "sensor",
        `Sensor ${sensorId} ${nextOffline ? "Fault Simulated (Offline)" : "Restored Online"}`,
        `${target.name} at ${target.location} transitioned to ${nextOffline ? "OFFLINE" : "ONLINE"}.`
      );
      pushToast(
        `Sensor ${sensorId} ${nextOffline ? "Offline" : "Online"}`,
        nextOffline
          ? "Simulated telemetry loss on sensor node."
          : "Sensor node telemetry restored.",
        nextOffline ? "warning" : "success"
      );
    },
    [allSensors, appendTimelineEvent, pushToast]
  );

  const triggerSensorSpike = useCallback(
    (sensorId: string) => {
      const target = allSensors.find((s) => s.id === sensorId);
      if (!target) return;
      const spikedValue = Number(
        (target.criticalThreshold * 1.15).toFixed(1)
      );
      setAllSensors((prev) =>
        prev.map((s) => {
          if (s.id !== sensorId) return s;
          return {
            ...s,
            value: spikedValue,
            status: "critical",
            lastUpdated: "09:54:25",
            history: [
              ...s.history.slice(1),
              { time: "09:54", value: spikedValue },
            ],
          };
        })
      );
      appendTimelineEvent(
        target.facilityId,
        "sensor",
        `Telemetry Spike on ${sensorId}: ${spikedValue} ${target.unit}`,
        `Simulated reading on ${target.name} crossed critical threshold (${target.criticalThreshold} ${target.unit}).`
      );
      pushToast(
        `Threshold Crossed: ${target.name}`,
        `Simulated reading (${spikedValue} ${target.unit}) exceeds critical threshold (${target.criticalThreshold} ${target.unit}).`,
        "danger"
      );
    },
    [allSensors, appendTimelineEvent, pushToast]
  );

  const updateSensorThresholds = useCallback(
    (
      sensorId: string,
      warningThreshold: number,
      criticalThreshold: number
    ) => {
      setAllSensors((prev) =>
        prev.map((s) => {
          if (s.id !== sensorId) return s;
          const nextStatus =
            s.status === "offline"
              ? "offline"
              : s.value >= criticalThreshold
              ? "critical"
              : s.value >= warningThreshold
              ? "warning"
              : "normal";
          return {
            ...s,
            warningThreshold,
            criticalThreshold,
            status: nextStatus,
          };
        })
      );
      pushToast(
        `Updated Demo Thresholds (${sensorId})`,
        `Warning: ${warningThreshold}, Critical: ${criticalThreshold}. Status re-evaluated.`,
        "info"
      );
    },
    [pushToast]
  );

  const applyScenarioPreset = useCallback(
    (scenarioId: string) => {
      const scenario = SIMULATION_SCENARIOS.find((s) => s.id === scenarioId);
      if (!scenario) return;

      setAllHazards((prev) =>
        prev.map((h) => {
          const override = scenario.hazardOverrides.find(
            (o) => o.hazardId === h.id
          );
          if (!override) return h;
          const base = h.baseRadius > 0 ? h.baseRadius : h.expandedRadius;
          return {
            ...h,
            active: override.active,
            severity: override.severity,
            radius: Math.round(base * override.radiusMultiplier),
          };
        })
      );

      setAllSensors((prev) =>
        prev.map((s) => {
          const override = scenario.sensorOverrides.find(
            (o) => o.sensorId === s.id
          );
          if (!override) return s;
          return {
            ...s,
            value: override.value,
            status: override.status,
            lastUpdated: "09:54:00",
          };
        })
      );

      setHazardExpansionStep(scenario.id === "SCN-GAS-01" ? 1 : 0);

      appendTimelineEvent(
        selectedFacilityId,
        "simulation",
        `Loaded Simulation Scenario: ${scenario.name}`,
        scenario.triggerSummary
      );

      pushToast(
        `Scenario Applied: ${scenario.code}`,
        `${scenario.name} loaded into Digital Twin and Route Engine.`,
        "info"
      );
    },
    [appendTimelineEvent, pushToast, selectedFacilityId]
  );

  const value: EvoraContextValue = {
    facilities: FACILITIES,
    selectedFacilityId,
    currentFacility,
    setSelectedFacilityId,
    uiState,
    setUiState,
    assets,
    sensors,
    hazards,
    routes,
    workers,
    alerts,
    timelineEvents,
    scenarios: SIMULATION_SCENARIOS,
    incidents,
    scoringConfig,
    hazardExpansionStep,
    lastUpdatedTimestamp,
    toasts,
    pushToast,
    dismissToast,
    acknowledgeAlert,
    triggerHazardExpansion,
    resetDemoState,
    updateScoringConfig,
    recalculateRoutesNow,
    toggleRouteAccessibility,
    toggleSensorFault,
    triggerSensorSpike,
    updateSensorThresholds,
    applyScenarioPreset,
  };

  return (
    <EvoraContext.Provider value={value}>{children}</EvoraContext.Provider>
  );
}

export function useEvora() {
  const ctx = useContext(EvoraContext);
  if (!ctx) {
    throw new Error("useEvora must be used inside EvoraProvider");
  }
  return ctx;
}
