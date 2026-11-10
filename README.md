# EVORA: Adaptive Emergency Evacuation Decision-Support Prototype

Interactive web prototype for **EVORA** (*Sistem Pendukung Keputusan Evakuasi Adaptif Berbasis IoT, Digital Twin, dan Hybrid Multi-Agent Simulation pada Depo Energi Hilir*).

> **Prototype Disclaimer:** This is a synthetic R&D demonstration application built with local simulated telemetry. It is not connected to real Pertamina infrastructure, live sensors, or a certified operational emergency-response system.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS (Light-mode-first industrial operational palette, WCAG AA verified)
- **Icons & Charts:** Lucide React + Recharts
- **Architecture:** Shared client-side simulation context (`src/lib/evora-context.tsx`) and deterministic multi-criteria route scoring (`src/lib/route-scoring.ts`)

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Information Architecture (6 Connected Pages)

1. **`/` (Emergency Command Center):** Facility status banner, 5 KPI cards, interactive depot schematic map, active alerts with map focus and acknowledgement, 30-minute telemetry trend charts, and system activity timeline.
2. **`/digital-twin` (Digital Twin Monitoring):** 2D orthographic map and 3D isometric Digital Twin projection toggle, 9 visualization layer toggles (`Assets`, `IoT Sensors`, `Gas (% LEL)`, `Temperature`, `Smoke / Fire`, `Wind Vector`, `Worker Agents`, `Risk Zones`, `Evacuation Routes`), pan/zoom controls, and 3-step historical sensor replay.
3. **`/evacuation` (Adaptive Evacuation):** Guided 2-state demonstration where expanding the hydrocarbon vapor plume near Route A causes Route A's risk score to exceed the configured threshold (`65/100`), automatically blocking Route A and promoting Route B (`South Perimeter Bypass`), synchronized with the **Dynamic Field Evacuation Signage Preview** (including a simulated main grid cut / backup LiFePO4 UPS battery test).
4. **`/simulation` (Hybrid Multi-Agent Simulation):** Top-down multi-agent canvas integrating **Worker Agents**, **Hazard Agents**, **Safety Agents**, and **Routing Agents**, with Play/Pause, Step +15s, Reset, 1x/2x/4x speed, worker count slider (`16-64`), and scenario selector.
5. **`/sensors` (IoT Sensor Monitoring):** Searchable and filterable registry of temperature, gas (`% LEL`), smoke (`ppm`), flame (`IR Index`), and ultrasonic wind sensors, with historical charts, fault simulation toggle, reading spike trigger, and configurable demo thresholds.
6. **`/incidents` (Incidents & Scenario Management):** Simulated incident logs with event timelines and a 5-dimension evaluation matrix (`Evacuation Time`, `Hazard Exposure`, `Route Safety`, `Worker Density`, `Guidance Update Latency`) comparing **Static Signage**, **Shortest-Route Method**, and **EVORA Adaptive Recommendation** using explicitly labeled illustrative demo values.
