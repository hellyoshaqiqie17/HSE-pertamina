"use client";

import React from "react";
import { AlertCircle, Database, Loader2, RefreshCw } from "lucide-react";
import { useEvora } from "@/lib/evora-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UIStateWrapper({
  children,
  pageTitle,
}: {
  children: React.ReactNode;
  pageTitle: string;
}) {
  const { uiState, setUiState, resetDemoState } = useEvora();

  if (uiState === "loading") {
    return (
      <Card
        aria-live="polite"
        aria-busy="true"
        className="p-6 sm:p-8 my-4 space-y-4"
      >
        <div className="flex items-center gap-2.5 text-[#0F172A] font-semibold text-sm">
          <Loader2
            className="w-4 h-4 text-[#0F172A] animate-spin"
            aria-hidden="true"
          />
          <span>Synchronizing Digital Twin &amp; Telemetry...</span>
        </div>
        <p className="text-xs text-[#64748B]">
          Loading spatial nodes, plume dispersion contours, and route scores for{" "}
          {pageTitle}.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="h-20 rounded-xl skeleton skeleton-shimmer border border-[#E2E8F0]" />
          <div className="h-20 rounded-xl skeleton skeleton-shimmer border border-[#E2E8F0]" />
          <div className="h-20 rounded-xl skeleton skeleton-shimmer border border-[#E2E8F0]" />
        </div>
        <div>
          <Button
            type="button"
            variant="default"
            onClick={() => setUiState("ready")}
          >
            Complete Load Immediately
          </Button>
        </div>
      </Card>
    );
  }

  if (uiState === "empty") {
    return (
      <Card
        aria-live="polite"
        className="p-8 my-4 text-center max-w-xl mx-auto space-y-3"
      >
        <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] flex items-center justify-center mx-auto">
          <Database className="w-5 h-5" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-[#0F172A]">
          No Active Telemetry Loaded for {pageTitle}
        </h2>
        <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
          The scenario buffer is currently empty. Restore the default downstream
          depot dataset to inspect sensors, hazard contours, and evacuation
          corridors.
        </p>
        <div className="pt-2">
          <Button
            type="button"
            variant="default"
            onClick={() => {
              resetDemoState();
              setUiState("ready");
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Load Depot Dataset</span>
          </Button>
        </div>
      </Card>
    );
  }

  if (uiState === "error") {
    return (
      <Card
        role="alert"
        className="p-6 sm:p-8 my-4 max-w-xl mx-auto border-[#E2E8F0]"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] border border-red-200 flex items-center justify-center shrink-0">
            <AlertCircle
              className="w-4 h-4 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Telemetry Stream Interrupted
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              The MQTT broker simulation encountered a packet timeout while
              updating {pageTitle}. Field signage retains its last verified safe
              route on backup UPS power.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <Button
                type="button"
                variant="default"
                onClick={() => setUiState("ready")}
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reconnect Stream</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetDemoState}
              >
                Reset Baseline
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}
