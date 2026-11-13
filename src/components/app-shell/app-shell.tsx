"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Bot,
  Box,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  LayoutDashboard,
  Layers,
  Menu,
  Radio,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wind,
  X,
} from "lucide-react";
import { useEvora } from "@/lib/evora-context";
import { RiskBadge } from "@/components/shared/status-badge";
import { UIViewState } from "@/types/evora";

interface NavGroup {
  groupLabel: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
    badge?: number | string;
    badgeVariant?: "danger" | "warning" | "neutral";
  }[];
}

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
    hazards,
    workers,
    alerts,
    acknowledgeAlert,
    resetDemoState,
    triggerHazardExpansion,
    hazardExpansionStep,
    lastUpdatedTimestamp,
    toasts,
    dismissToast,
    currentRoleLevel,
    setCurrentRoleLevel,
    stationaryPosts,
    aiExplosionPrediction,
    isDelugeActive,
    toggleDelugeSystem,
    triggerSideBInspectionScenario,
    isSideBScenarioActive,
  } = useEvora();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;
  const criticalSensorsCount = sensors.filter((s) => s.status === "critical").length;
  const affectedWorkersCount = workers.filter((w) => w.status === "affected").length;
  const recommendedRoute = routes.find((r) => r.status === "recommended") ?? routes[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileNavOpen(false);
        setCopilotOpen(false);
        setNotificationsOpen(false);
        setSettingsOpen(false);
        setProfileMenuOpen(false);
        setSearchFocused(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchFocused(true);
        setNotificationsOpen(false);
        setSettingsOpen(false);
        setCopilotOpen(false);
        setTimeout(() => searchInputRef.current?.focus(), 20);
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

  const navGroups: NavGroup[] = [
    {
      groupLabel: "Sistem Operasional",
      items: [
        {
          href: "/",
          label: "Dasbor Utama",
          icon: LayoutDashboard,
        },
        {
          href: "/digital-twin",
          label: "Digital Twin 3D",
          icon: Box,
        },
        {
          href: "/evacuation",
          label: "Adaptif Evakuasi",
          icon: ShieldAlert,
          badge: recommendedRoute ? recommendedRoute.shortCode : undefined,
          badgeVariant: "neutral",
        },
      ],
    },
    {
      groupLabel: "Simulasi & AI",
      items: [
        {
          href: "/simulation",
          label: "Simulasi Agen",
          icon: Activity,
          badge: `${workers.length} Agen`,
          badgeVariant: "neutral",
        },
        {
          href: "/sensors",
          label: "Sensor & IoT",
          icon: Radio,
          badge: criticalSensorsCount > 0 ? `${criticalSensorsCount} Crit` : undefined,
          badgeVariant: "danger",
        },
        {
          href: "/incidents",
          label: "Skenario Bahaya",
          icon: Flame,
          badge: unacknowledgedCount > 0 ? unacknowledgedCount : undefined,
          badgeVariant: "danger",
        },
      ],
    },
  ];

  const roleLevelOptions: {
    value: import("@/types/evora").UserRoleLevel;
    label: string;
    shortLabel: string;
    badge: string;
    desc: string;
  }[] = [
    {
      value: "level-1-operator",
      label: "L1 · Operator Lapangan",
      shortLabel: "L1 · Operator",
      badge: "L1 OPR",
      desc: "Operasional gantry & pompa, eksekusi ESD lokal",
    },
    {
      value: "level-2-inspector",
      label: "L2 · Inspektur K3 (Sidak B)",
      shortLabel: "L2 · Inspektur",
      badge: "L2 SIDAK",
      desc: "Audit kepatuhan di Side B, evakuasi koridor selatan mandiri",
    },
    {
      value: "level-3-manager",
      label: "L3 · Depot Manager",
      shortLabel: "L3 · Manager",
      badge: "L3 MGR",
      desc: "Komando krisis depot penuh & aktivasi Deluge T-102",
    },
    {
      value: "level-4-ert",
      label: "L4 · Tim Tanggap Darurat",
      shortLabel: "L4 · Tim ERT",
      badge: "L4 ERT",
      desc: "Penanggulangan busa api & perimeter Ex-Zone 1",
    },
  ];
  const activeRoleMeta =
    roleLevelOptions.find((r) => r.value === currentRoleLevel) ?? roleLevelOptions[0];

  const isNavActive = (href: string) => {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex w-full bg-[#FAFBFC] text-slate-900 font-sans">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 py-2 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:font-semibold"
      >
        Skip to main operational workspace
      </a>

      {/* ====================================================================
          DESKTOP SIDEBAR (matching C:/pkm & C:/ti .admin-sidebar architecture)
          ==================================================================== */}
      <aside
        className={`hidden lg:flex flex-col w-[260px] h-screen bg-white border-r border-slate-200/90 fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Sidebar Header / Logo matching C:/ti & C:/pkm .admin-sidebar-header */}
        <div className="h-14 px-5 border-b border-[#E2E8F0] flex items-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 group cursor-pointer"
            title="EVORA HSE Incident Command System"
          >
            <div className="w-9 h-9 rounded-[10px] bg-[#4B6BFB] group-hover:bg-[#3B5BEB] text-white flex items-center justify-center transition-colors shrink-0">
              <Compass className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[15px] text-[#0F172A] tracking-tight leading-tight">
                EVORA
              </span>
              <span className="text-[11px] font-medium text-[#64748B] truncate leading-tight">
                HSE Decision Support
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav aria-label="Sidebar main navigation" className="flex-1 px-3 py-3 overflow-y-auto space-y-5">
          {navGroups.map((group) => (
            <div key={group.groupLabel} className="space-y-0.5">
              <div className="nav-group-label">{group.groupLabel}</div>
              {group.items.map((item) => {
                const active = isNavActive(item.href);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`admin-nav-item ${active ? "active" : ""}`}
                  >
                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active ? "text-[#4B6BFB]" : "text-[#94A3B8]"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                          item.badgeVariant === "danger"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-[#F1F5F9] text-[#475569]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Active Facility Status Card */}
        <div className="p-3.5 border-t border-[#E2E8F0] bg-[#FAFBFC]">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748B]">Active Depot</span>
              <span className="h-2 w-2 rounded-full bg-[#10B981]" aria-hidden="true" />
            </div>
            <div className="text-xs font-semibold text-[#0F172A] truncate">
              {currentFacility.name.replace("Synthetic ", "")}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono">
              <span>{currentFacility.code}</span>
              <span className="text-emerald-700 font-medium">Telemetry Ready</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ====================================================================
          MAIN WRAPPER & TOPBAR (matching C:/pkm & C:/ti structure)
          ==================================================================== */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "lg:ml-0" : "lg:ml-[260px]"
        }`}
      >
        {/* Sticky TopBar (height: 56px, background: #ffffff, matching C:/ti & C:/pkm TopBar) */}
        <header className="h-14 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 sticky top-0 z-30 flex items-center justify-between gap-4">
          {/* TopBar Left: Toggle + Single-Line Facility Telemetry Status */}
          <div className="flex items-center gap-3 min-w-0 shrink">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileNavOpen(true);
                } else {
                  setSidebarCollapsed((prev) => !prev);
                }
              }}
              className="w-9 h-9 rounded-[10px] border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Toggle Navigation Sidebar"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#E2E8F0] text-xs whitespace-nowrap shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" aria-hidden="true" />
              <span className="font-semibold text-[#0F172A]">{currentFacility.code}</span>
              <span className="text-[#94A3B8] hidden md:inline">·</span>
              <span className="font-mono text-[11px] text-[#64748B] hidden md:inline">
                {sensors.length} Nodes
              </span>
            </div>
          </div>

          {/* TopBar Right: Role Perspective + Quick Search + Decision Support + Alerts + Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Concise Single-Line Role Perspective Switcher */}
            <div className="hidden sm:inline-flex items-center h-9 px-3 rounded-[10px] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors shrink-0">
              <select
                aria-label="Pilih Level Otoritas & Peran"
                value={currentRoleLevel}
                onChange={(e) => setCurrentRoleLevel(e.target.value as import("@/types/evora").UserRoleLevel)}
                className="bg-transparent text-xs font-semibold text-[#0F172A] focus:outline-none cursor-pointer whitespace-nowrap"
              >
                {roleLevelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Search Popover Trigger (Ctrl+K) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSearchFocused((prev) => !prev);
                  setCopilotOpen(false);
                  setNotificationsOpen(false);
                  setSettingsOpen(false);
                  setTimeout(() => searchInputRef.current?.focus(), 20);
                }}
                aria-expanded={searchFocused}
                aria-label="Cari aset dan sensor (Ctrl+K)"
                title="Cari aset, rute, sensor (Ctrl+K)"
                className="w-9 h-9 rounded-[10px] bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
              </button>

              {searchFocused && (
                <div
                  role="dialog"
                  aria-label="Pencarian cepat aset & sensor"
                  className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-elevated z-50 p-3 space-y-2.5"
                >
                  <div className="relative">
                    <Search
                      className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={globalQuery}
                      onChange={(e) => setGlobalQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setSearchFocused(false);
                        }
                      }}
                      placeholder="Cari tangki, sensor, rute..."
                      className="w-full h-9 pl-8 pr-8 rounded-[10px] bg-[#F8FAFC] text-xs text-[#0F172A] placeholder:text-[#94A3B8] border border-[#E2E8F0] focus:bg-white focus:border-[#4B6BFB] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchFocused(false)}
                      aria-label="Tutup pencarian"
                      className="absolute right-2 top-2 p-0.5 rounded text-[#94A3B8] hover:text-[#0F172A]"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {globalQuery.trim().length > 0 ? (
                    searchResults.length === 0 ? (
                      <div className="py-2 px-1 text-xs text-[#64748B]">
                        Tidak ditemukan hasil untuk &quot;{globalQuery}&quot;.
                      </div>
                    ) : (
                      <ul className="divide-y divide-[#F1F5F9] max-h-64 overflow-y-auto text-xs">
                        {searchResults.map((res) => (
                          <li key={res.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchFocused(false);
                                setGlobalQuery("");
                                router.push(res.href);
                              }}
                              className="w-full text-left px-2.5 py-2 hover:bg-[#F8FAFC] rounded-lg flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <span className="font-semibold text-[#0F172A] truncate">
                                {res.title}
                              </span>
                              <span className="text-[10px] font-mono text-[#64748B] shrink-0">
                                {res.category}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )
                  ) : (
                    <div className="text-[11px] text-[#64748B] px-1">
                      Ketik kode aset (mis. T-102, AP-BRAVO) atau ID sensor. Tekan Ctrl+K kapan saja.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Decision Support Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setCopilotOpen((prev) => !prev);
                setNotificationsOpen(false);
                setSettingsOpen(false);
                setSearchFocused(false);
              }}
              className="h-9 flex items-center gap-1.5 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4B6BFB] px-3 rounded-[10px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Buka Panel Decision Support"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#4B6BFB] shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Decision Support</span>
            </button>

            {/* Safety Notifications Bell Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setCopilotOpen(false);
                  setSettingsOpen(false);
                  setSearchFocused(false);
                }}
                aria-expanded={notificationsOpen}
                aria-label={`Notifikasi keselamatan (${unacknowledgedCount} aktif)`}
                className="w-9 h-9 rounded-[10px] bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] flex items-center justify-center relative cursor-pointer transition-colors"
                title="Notifikasi & Peringatan Bahaya"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {unacknowledgedCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                    {unacknowledgedCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Modal */}
              {notificationsOpen && (
                <div
                  role="dialog"
                  aria-label="Active facility safety alerts"
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-4"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">
                      Peringatan Darurat Aktif ({alerts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto">
                    {alerts.map((al) => (
                      <div
                        key={al.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <RiskBadge level={al.severity} />
                          <span className="font-mono text-slate-500 text-[11px]">
                            {al.timestamp}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900">{al.title}</div>
                        <p className="text-slate-600">{al.description}</p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="font-mono text-[11px] text-slate-500">
                            {al.location}
                          </span>
                          {al.acknowledged ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              Diakui
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => acknowledgeAlert(al.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                            >
                              Konfirmasi
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Simulation & Settings Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen((prev) => !prev);
                  setCopilotOpen(false);
                  setNotificationsOpen(false);
                  setSearchFocused(false);
                }}
                aria-expanded={settingsOpen}
                aria-label="Simulation settings and controls"
                className="w-9 h-9 rounded-[10px] bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] flex items-center justify-center cursor-pointer transition-colors"
                title="Pengaturan Simulasi & Fasilitas"
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              </button>

              {settingsOpen && (
                <div
                  role="dialog"
                  aria-label="Simulation configuration panel"
                  className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-[#E2E8F0] shadow-elevated z-50 p-4 text-xs space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                    <span className="font-bold text-sm text-[#0F172A]">
                      Pengaturan Skenario EVORA
                    </span>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(false)}
                      className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="header-facility-select"
                      className="block font-semibold text-[#334155] mb-1"
                    >
                      Fasilitas Aktif:
                    </label>
                    <select
                      id="header-facility-select"
                      value={selectedFacilityId}
                      onChange={(e) => setSelectedFacilityId(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] font-semibold text-[#0F172A]"
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
                      className="block font-semibold text-[#334155] mb-1"
                    >
                      Uji Ketahanan UI:
                    </label>
                    <select
                      id="header-ui-state-select"
                      value={uiState}
                      onChange={(e) => setUiState(e.target.value as UIViewState)}
                      className="w-full px-3 py-2 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-[#0F172A]"
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
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reset Data Simulasi Baseline</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Summary + Monogram matching C:/pkm & C:/ti */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0] ml-1 shrink-0">
              <div className="text-right hidden xl:block leading-tight">
                <div className="text-xs font-semibold text-[#0F172A]">PT EVORA</div>
                <div className="text-[11px] font-mono text-[#64748B]">
                  {activeRoleMeta.shortLabel}
                </div>
              </div>
              <div className="w-9 h-9 rounded-[10px] bg-[#0F172A] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                {activeRoleMeta.badge.split(" ")[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper (matching C:/pkm & C:/ti clean #FAFBFC surface) */}
        <main
          id="main-workspace"
          className="flex-1 p-4 sm:p-6 pb-24 lg:pb-8 bg-[#FAFBFC] overflow-y-auto"
        >
          <div className="max-w-[1600px] mx-auto w-full space-y-6">
            {children}
          </div>
        </main>

        {/* Footer Landmark */}
        <footer className="bg-white border-t border-[#E2E8F0] px-6 py-3 text-xs text-[#64748B] hidden sm:block">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong className="text-[#0F172A]">EVORA Decision-Support System</strong>: IoT Multi-Hazard, Digital Twin 3D &amp; Hybrid Multi-Agent Evacuation.
            </div>
            <div className="font-mono text-[11px] text-[#94A3B8]">
              Pertamina TBBM Demo Dataset ({currentFacility.code}) · Live Telemetry Engine
            </div>
          </div>
        </footer>
      </div>

      {/* ====================================================================
          DECISION SUPPORT SLIDE-OUT DRAWER (matching C:/ti panel structure)
          ==================================================================== */}
      {copilotOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="EVORA Decision Support"
          className="fixed inset-0 z-50 flex justify-end"
        >
          <div
            className="fixed inset-0 bg-[#0F172A]/25 transition-opacity"
            onClick={() => setCopilotOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-elevated flex flex-col z-10 border-l border-[#E2E8F0]">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-[#4B6BFB] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">EVORA Decision Support</h3>
                  <p className="text-[11px] text-[#64748B] font-mono">
                    Adaptive Evacuation &amp; Hazard Engine
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCopilotOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Copilot Body / Live Recommendations */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              {/* Dynamic Perspective Briefing based on currentRoleLevel */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Briefing Otoritas Level
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    currentRoleLevel === "level-2-inspector"
                      ? "bg-amber-100 text-amber-800"
                      : currentRoleLevel === "level-3-manager"
                      ? "bg-blue-100 text-blue-800"
                      : currentRoleLevel === "level-4-ert"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-slate-200 text-slate-800"
                  }`}>
                    {currentRoleLevel === "level-1-operator"
                      ? "Level 1: Operator"
                      : currentRoleLevel === "level-2-inspector"
                      ? "Level 2: Inspektur K3 (Sidak B)"
                      : currentRoleLevel === "level-3-manager"
                      ? "Level 3: Incident Commander"
                      : "Level 4: ERT Tim Khusus"}
                  </span>
                </div>

                {currentRoleLevel === "level-2-inspector" && (
                  <div className="text-slate-700 space-y-1.5 leading-relaxed">
                    <p className="font-semibold text-amber-900">
                      Anda sedang melakukan inspeksi (sidak) di Gantry Bay B (Side B).
                    </p>
                    <p className="text-slate-600">
                      Jika terjadi lonjakan hidrokarbon atau potensi BLEVE di T-102, koridor manifold utama terhalang plume. <strong>JANGAN melintasi utara</strong>; evakuasi mandiri melalui <strong>Jalur B Selatan langsung ke Titik Kumpul AP-BRAVO</strong>.
                    </p>
                  </div>
                )}

                {currentRoleLevel === "level-1-operator" && (
                  <div className="text-slate-700 space-y-1.5 leading-relaxed">
                    <p className="font-semibold text-slate-900">
                      Fokus: Operasional Aman & Penghentian Darurat (ESD).
                    </p>
                    <p className="text-slate-600">
                      Segera putuskan aliran bottom loading rack, lepas selang grounding, dan ikuti rambu arah dinamis terdekat menuju assembly point terdekat.
                    </p>
                  </div>
                )}

                {currentRoleLevel === "level-3-manager" && (
                  <div className="text-slate-700 space-y-1.5 leading-relaxed">
                    <p className="font-semibold text-blue-900">
                      Komando Penuh Depo & Otorisasi Penanganan Bencana.
                    </p>
                    <p className="text-slate-600">
                      Wewenang penuh evakuasi serentak 8 pos stasioner, pengaktifan sistem pendingin <strong>Deluge Spray T-102</strong>, dan koordinasi dengan Kantor Pusat Pertamina.
                    </p>
                  </div>
                )}

                {currentRoleLevel === "level-4-ert" && (
                  <div className="text-slate-700 space-y-1.5 leading-relaxed">
                    <p className="font-semibold text-rose-900">
                      Operasi Penanggulangan Bahaya & Pemadaman (ERT).
                    </p>
                    <p className="text-slate-600">
                      Gelar foam tender di sisi upwind, pastikan perimeter isolasi Ex-Zone 1 aman, dan amankan evakuasi petugas stasioner dari koridor pipa.
                    </p>
                  </div>
                )}
              </div>

              {/* Status Alert Banner */}
              <div className="p-3.5 rounded-xl bg-[#EEF2FF] border border-[#4B6BFB]/20 text-[#0F172A] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                  <ShieldCheck className="w-4 h-4 text-[#4B6BFB] shrink-0" aria-hidden="true" />
                  <span>Rekomendasi Rute Evakuasi Optimal</span>
                </div>
                <p className="text-[#475569] leading-relaxed">
                  Berdasarkan sensor LEL pada koridor pipa dan vektor angin <strong>4.8 m/s SE</strong>, rute evakuasi terbaik saat ini:
                </p>
                <div className="font-bold font-mono text-sm text-[#0F172A] bg-white p-2 rounded-[10px] border border-[#E2E8F0]">
                  {recommendedRoute.shortCode}: {recommendedRoute.name} ({recommendedRoute.destinationName})
                </div>
              </div>

              {/* Multi-Agent Telemetry Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">Dinamika Evakuasi Agen</span>
                  <span className="font-mono text-[11px] text-[#64748B]">{workers.length} Personel</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-[10px] bg-emerald-50 border border-emerald-200">
                    <div className="text-lg font-bold text-emerald-700">
                      {workers.filter((w) => w.status === "evacuated" || w.status === "moving").length}
                    </div>
                    <div className="text-[10px] text-emerald-800 font-medium">Bergerak Aman</div>
                  </div>
                  <div className="p-2 rounded-[10px] bg-red-50 border border-red-200">
                    <div className="text-lg font-bold text-red-700">
                      {affectedWorkersCount}
                    </div>
                    <div className="text-[10px] text-red-800 font-medium">Di Zona Terpapar</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-[#334155] block">Aksi Cepat Kontrol:</span>

                <button
                  type="button"
                  onClick={() => {
                    triggerSideBInspectionScenario();
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-950 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Uji Insiden Side B (Sidak Terancam)</span>
                    </div>
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      Simulasi inspektur Level 2 di Bay B saat uap naik
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleDelugeSystem();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between group transition-colors cursor-pointer ${
                    isDelugeActive
                      ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                      : "bg-blue-50 hover:bg-blue-100/80 border-blue-200 text-blue-950"
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isDelugeActive ? "Deluge Spray T-102 Aktif (1,400 L/m)" : "Aktifkan Deluge Spray T-102"}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {isDelugeActive ? "Tekan untuk menonaktifkan pendingin" : "Cegah potensi ledakan BLEVE Tangki Pertalite"}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHazardExpansion();
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-slate-900">Simulasikan Perubahan Plume</div>
                    <div className="text-[11px] text-slate-500">Uji re-routing adaptif rute evakuasi</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    router.push("/simulation");
                    setCopilotOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-slate-900">Buka Tahap Simulasi Interaktif</div>
                    <div className="text-[11px] text-slate-500">Inspeksi telemetri per agen pekerja & Level 2</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Copilot Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center font-mono">
              EVORA Agentic Hybrid Decision Support Engine v2.4
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MOBILE DRAWER (when on small screens)
          ==================================================================== */}
      {mobileNavOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          <div
            className="fixed inset-0 bg-[#0F172A]/35"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full p-4 flex flex-col justify-between z-10 border-r border-[#E2E8F0] shadow-elevated">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] bg-[#4B6BFB] text-white flex items-center justify-center">
                    <Compass className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="font-bold text-base text-[#0F172A]">EVORA HSE</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobile navigation list" className="space-y-4">
                {navGroups.map((group) => (
                  <div key={group.groupLabel} className="space-y-1">
                    <div className="text-[10px] font-bold uppercase text-[#94A3B8] px-2 tracking-wider">
                      {group.groupLabel}
                    </div>
                    {group.items.map((item) => {
                      const active = isNavActive(item.href);
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-xs font-semibold ${
                            active
                              ? "bg-[#EEF2FF] text-[#4B6BFB]"
                              : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                          }`}
                        >
                          <IconComponent className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  resetDemoState();
                  setMobileNavOpen(false);
                }}
                className="w-full py-2.5 rounded-[10px] bg-red-600 text-white text-xs font-semibold cursor-pointer"
              >
                Reset Demo Baseline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Stack */}
      {toasts.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        >
          {toasts.map((t) => {
            const dotColor =
              t.tone === "danger"
                ? "bg-rose-500"
                : t.tone === "warning"
                ? "bg-amber-500"
                : t.tone === "success"
                ? "bg-emerald-500"
                : "bg-slate-900";
            return (
              <div
                key={t.id}
                className="pointer-events-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-lg flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotColor}`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      {t.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {t.detail}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(t.id)}
                  aria-label="Dismiss notification"
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"
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