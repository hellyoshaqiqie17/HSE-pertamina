"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Compass,
  Menu,
  RotateCcw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEvora } from "@/lib/evora-context";
import { DemoDataBadge, RiskBadge } from "@/components/shared/status-badge";
import { UIViewState } from "@/types/evora";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/digital-twin", label: "Digital Twin" },
  { href: "/evacuation", label: "Evacuation" },
  { href: "/simulation", label: "Simulation" },
  { href: "/sensors", label: "Sensors" },
  { href: "/incidents", label: "Incidents & Scenarios" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    facilities,
    selectedFacilityId,
    currentFacility,
    setSelectedFacilityId,
    uiState,
    setUiState,
    assets,
    sensors,
    routes,
    alerts,
    acknowledgeAlert,
    resetDemoState,
    lastUpdatedTimestamp,
    toasts,
    dismissToast,
  } = useEvora();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileNavOpen(false);
        setNotificationsOpen(false);
        setSettingsOpen(false);
        setProfileMenuOpen(false);
        setSearchFocused(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return [];
    const results: {
      id: string;
      title: string;
      category: string;
      href: string;
    }[] = [];

    for (const r of routes) {
      if (
        r.name.toLowerCase().includes(q) ||
        r.shortCode.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      ) {
        results.push({
          id: r.id,
          title: `${r.shortCode}: ${r.name} (${r.status.toUpperCase()})`,
          category: "Evacuation Route",
          href: "/evacuation",
        });
      }
    }
    for (const s of sensors) {
      if (
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
      ) {
        results.push({
          id: s.id,
          title: `${s.id}: ${s.name} (${s.value} ${s.unit})`,
          category: "IoT Sensor",
          href: "/sensors",
        });
      }
    }
    for (const a of assets) {
      if (
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q)
      ) {
        results.push({
          id: a.id,
          title: `${a.code}: ${a.name}`,
          category: "Digital Twin Asset",
          href: "/digital-twin",
        });
      }
    }
    return results.slice(0, 6);
  }, [assets, globalQuery, routes, sensors]);

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-ink-primary">
      {/* Skip Link for Keyboard Users */}
      <a
        href="#main-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 py-2.5 focus:bg-[#C84B28] focus:text-white focus:rounded-control focus:font-semibold"
      >
        Skip to main operational workspace
      </a>

      {/* Top Application Bar - Modern Minimalist Style matching C:/ti & C:/hellyoshaqiqie */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-2.5 sticky top-0 z-30 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div className="max-w-[1640px] mx-auto flex items-center justify-between gap-3">
          {/* Left: Brand Wordmark + Horizontal Pill Tabs */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              aria-label="EVORA Adaptive Evacuation Intelligence Home"
              className="inline-flex items-center gap-2.5 pr-2 shrink-0 group cursor-pointer"
              title="EVORA Adaptive Evacuation Decision-Support System"
            >
              <span className="w-9 h-9 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white flex items-center justify-center transition-all shadow-xs">
                <Compass className="w-4 h-4 text-white" aria-hidden="true" />
              </span>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-sm text-slate-900 leading-none">
                  EVORA
                </span>
                <span className="text-[10px] font-mono font-medium text-slate-500 leading-tight">
                  HSE Pertamina
                </span>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-navigation-drawer"
              className="lg:hidden inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 hover:bg-slate-200/70 cursor-pointer"
            >
              <Menu className="w-4 h-4" aria-hidden="true" />
              <span>Menu</span>
            </button>

            {/* Desktop Horizontal Pill Tabs */}
            <nav
              aria-label="Main navigation"
              className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80"
            >
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-4 h-8 inline-flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search Bar + Notification Bell + Operator Box */}
          <div className="flex items-center gap-2">
            {/* Search Input Box */}
            <div className="relative hidden sm:block w-52 md:w-64">
              <label htmlFor="global-header-search" className="sr-only">
                Search depot assets, sensors, or routes
              </label>
              <input
                ref={searchInputRef}
                id="global-header-search"
                type="search"
                value={globalQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setGlobalQuery(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Search (Ctrl + K)"
                className="w-full h-9 pl-3.5 pr-8 rounded-xl bg-slate-100 text-xs font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/80 focus:bg-white focus:border-slate-400 transition-all"
              />
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none"
                aria-hidden="true"
              />

              {searchFocused && globalQuery.trim().length > 0 && (
                <div
                  role="region"
                  aria-label="Quick search results"
                  className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 text-xs"
                >
                  {searchResults.length === 0 ? (
                    <div className="p-2.5 text-slate-500">
                      No matching depot assets, sensors, or routes for &quot;
                      {globalQuery}&quot;.
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {searchResults.map((res) => (
                        <li key={res.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchFocused(false);
                              setGlobalQuery("");
                              router.push(res.href);
                            }}
                            className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span className="font-semibold text-slate-900 truncate">
                              {res.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">
                              {res.category}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((o) => !o);
                  setSettingsOpen(false);
                  setProfileMenuOpen(false);
                }}
                aria-expanded={notificationsOpen}
                aria-label={`Safety notifications (${unacknowledgedCount} unacknowledged)`}
                className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 hover:bg-slate-200/70 flex items-center justify-center relative text-slate-700 cursor-pointer transition-colors"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {unacknowledgedCount > 0 && (
                  <span
                    className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"
                    aria-hidden="true"
                  />
                )}
              </button>

              {notificationsOpen && (
                <div
                  role="dialog"
                  aria-label="Active facility alerts"
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-40 p-4"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">
                      Active Safety Alerts ({alerts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      aria-label="Close alerts panel"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto">
                    {alerts.map((al) => (
                      <div
                        key={al.id}
                        className="p-3 rounded-control bg-canvas border border-border-subtle text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <RiskBadge level={al.severity} />
                          <span className="font-mono text-ink-secondary">
                            {al.timestamp}
                          </span>
                        </div>
                        <div className="font-semibold text-ink-primary">
                          {al.title}
                        </div>
                        <p className="text-ink-secondary">{al.description}</p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="font-mono text-[11px] text-ink-muted">
                            {al.location}
                          </span>
                          {al.acknowledged ? (
                            <span className="inline-flex items-center gap-1 text-[#136C34] font-semibold">
                              <CheckCircle2
                                className="w-3.5 h-3.5"
                                aria-hidden="true"
                              />
                              Acknowledged
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => acknowledgeAlert(al.id)}
                              className="px-2.5 py-1 min-h-[34px] rounded bg-[#18181B] text-white font-semibold hover:bg-[#27272A]"
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Facility & View State Settings Square Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen((o) => !o);
                  setNotificationsOpen(false);
                  setProfileMenuOpen(false);
                }}
                aria-expanded={settingsOpen}
                aria-label="Facility selector and simulation view state controls"
                className="w-10 h-10 rounded-[6px] bg-pill hover:bg-[#E4E0D8] flex items-center justify-center text-ink-primary"
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              </button>

              {settingsOpen && (
                <div
                  role="dialog"
                  aria-label="Facility and view state configuration"
                  className="absolute right-0 mt-2 w-80 rounded-card bg-surface border border-border-control shadow-lg z-40 p-4 text-xs space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <span className="font-bold text-sm text-ink-primary">
                      Simulation & Facility Controls
                    </span>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(false)}
                      aria-label="Close simulation controls"
                      className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded text-ink-secondary hover:bg-canvas"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="header-facility-select"
                      className="block font-semibold text-ink-secondary mb-1"
                    >
                      Active Synthetic Facility:
                    </label>
                    <select
                      id="header-facility-select"
                      value={selectedFacilityId}
                      onChange={(e) => setSelectedFacilityId(e.target.value)}
                      className="w-full px-3 py-2 min-h-[40px] rounded-control bg-canvas border border-border-control font-semibold text-ink-primary"
                    >
                      {facilities.map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          {fac.code}: {fac.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="header-ui-state-select"
                      className="block font-semibold text-ink-secondary mb-1"
                    >
                      Test UI Resilience State (R-27):
                    </label>
                    <select
                      id="header-ui-state-select"
                      value={uiState}
                      onChange={(e) =>
                        setUiState(e.target.value as UIViewState)
                      }
                      className="w-full px-3 py-2 min-h-[40px] rounded-control bg-canvas border border-border-control font-mono text-ink-primary"
                    >
                      <option value="ready">Operational (Ready)</option>
                      <option value="loading">Loading Telemetry</option>
                      <option value="empty">Empty Buffer</option>
                      <option value="error">Stream Error</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      resetDemoState();
                      setSettingsOpen(false);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 min-h-[40px] rounded-control bg-[#C84B28] text-white font-semibold hover:bg-[#A93B1D]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reset Demo Baseline</span>
                  </button>
                </div>
              )}
            </div>

            {/* Operator Avatar Square Button (Honest Placeholder per R-23) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen((o) => !o);
                  setNotificationsOpen(false);
                  setSettingsOpen(false);
                }}
                aria-expanded={profileMenuOpen}
                aria-label="Operator profile and session details"
                className="w-10 h-10 rounded-[6px] bg-[#18181B] text-white font-mono text-xs font-bold flex items-center justify-center hover:bg-[#27272A]"
              >
                OP
              </button>

              {profileMenuOpen && (
                <div
                  role="dialog"
                  aria-label="Operator session details"
                  className="absolute right-0 mt-2 w-72 rounded-card bg-surface border border-border-control shadow-lg z-40 p-4 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <div>
                      <div className="font-bold text-ink-primary text-sm">
                        HSE Duty Officer [DEMO]
                      </div>
                      <div className="text-ink-secondary font-mono">
                        {currentFacility.code} | Sync: {lastUpdatedTimestamp}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileMenuOpen(false)}
                      aria-label="Close operator menu"
                      className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded text-ink-secondary hover:bg-canvas"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="text-ink-secondary leading-relaxed">
                    EVORA R&amp;D Prototype (UNAIR Occupational Health &amp;
                    Safety + Robotics &amp; AI). All readings and evacuation
                    routes use synthetic data.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      resetDemoState();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full py-2 min-h-[40px] rounded-control bg-[#18181B] text-white font-semibold hover:bg-[#27272A]"
                  >
                    Reset All Simulation Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileNavOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-surface h-full p-4 flex flex-col justify-between z-10 border-r border-border-subtle">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded bg-[#C84B28] text-white font-mono text-xs font-bold flex items-center justify-center">
                    EV
                  </span>
                  <span className="font-bold text-base text-ink-primary">
                    EVORA [DEMO]
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-control border border-border-control text-ink-primary"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobile navigation" className="space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 min-h-[48px] rounded-[6px] text-sm font-semibold ${
                        isActive
                          ? "bg-[#18181B] text-white"
                          : "bg-pill text-ink-primary"
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-border-subtle space-y-2">
              <button
                type="button"
                onClick={() => {
                  resetDemoState();
                  setMobileNavOpen(false);
                }}
                className="w-full py-2.5 min-h-[44px] rounded-[6px] bg-[#C84B28] text-white text-xs font-semibold"
              >
                Reset Demo Baseline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Landmark */}
      <main
        id="main-workspace"
        className="flex-1 px-4 sm:px-6 py-5 pb-24 lg:pb-8 max-w-[1640px] w-full mx-auto"
      >
        {children}
      </main>

      {/* Footer Landmark */}
      <footer className="bg-surface border-t border-border-subtle px-4 sm:px-6 py-3.5 pb-24 lg:pb-3.5 text-xs text-ink-secondary">
        <div className="max-w-[1640px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <strong>EVORA Demonstration Prototype</strong>: IoT, Digital Twin
            &amp; Hybrid Multi-Agent Evacuation Decision Support.
          </div>
          <div className="font-mono text-[11px] text-ink-muted">
            Synthetic R&amp;D Dataset ({currentFacility.code}) | Not connected
            to live Pertamina infrastructure
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile quick navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border-control grid grid-cols-6"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2.5 min-h-[52px] text-[10px] font-semibold ${
                isActive
                  ? "bg-[#18181B] text-white"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <span className="truncate max-w-[58px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Toast Notification Stack */}
      {toasts.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 lg:bottom-5 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        >
          {toasts.map((t) => {
            const dotColor =
              t.tone === "danger"
                ? "bg-[#C84B28]"
                : t.tone === "warning"
                ? "bg-amber-500"
                : t.tone === "success"
                ? "bg-emerald-500"
                : "bg-[#18181B]";
            return (
              <div
                key={t.id}
                className="pointer-events-auto rounded-2xl border border-[#E2E2DE] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotColor}`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#18181B]">
                      {t.title}
                    </div>
                    <div className="text-xs text-[#52525B] mt-0.5 leading-relaxed">
                      {t.detail}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(t.id)}
                  aria-label="Dismiss notification"
                  className="p-1 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-lg text-[#68686F] hover:bg-[#F7F7F4] hover:text-[#18181B]"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
