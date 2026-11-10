# EVORA Design System: Modern Minimalist Industrial HMI (`shadcn/ui` + `Satoshi`)

## 1. Visual Direction & Reference Alignment
- **Primary Aesthetic:** Modern Minimalist Industrial HMI (`shadcn/ui` component primitives combined with the warm alabaster-stone & crisp-white surface language of `C:\ti` and `C:\hellyoshaqiqie`).
- **Surface Hierarchy:**
  - **Page Canvas (`--color-canvas`):** `#F7F7F4` (Warm Alabaster Stone, matching `C:\hellyoshaqiqie` `--color-canvas: #f7f7f4`).
  - **Primary Card (`--color-card`):** `#FFFFFF` (Crisp White `rounded-2xl` / `16px` surface with `1px solid #E2E2DE` border and subtle multi-layer elevation `0 1px 2px rgba(0,0,0,0.03), 0 1px 6px rgba(0,0,0,0.04)`).
  - **Nested Well / Segmented Control Track (`--color-pill`):** `#F1F1EE` (`rounded-[10px]` / `rounded-xl` with `1px solid #E2E2DE`).
- **Zero AI-Slop Highlight Banners:**
  - Full-bleed pastel callout boxes (`bg-green-50`, `bg-red-50`, `bg-amber-50`) and uppercase demo state ribbons are strictly prohibited.
  - Status is communicated through crisp white `shadcn/ui` `<Card>` containers, neutral `#F7F7F4` wells, and minimalist `<Badge dot>` indicators with a `6px` semantic dot (`#16A34A` safe, `#D97706` warning, `#C84B28` critical, `#2563EB` info).

## 2. Typography (`C:\ti` & `C:\hellyoshaqiqie` Stack)
- **Primary UI & Display Sans (`--font-sans`):** `Satoshi` (loaded via Fontshare `satoshi@900,700,500,400,300`), with fallback to `Plus Jakarta Sans` and system sans.
- **Technical Telemetry & Coordinates (`--font-mono`):** `JetBrains Mono` with `font-variant-numeric: tabular-nums` applied to all LEL percentages, route risk scores (`0-100`), sensor thresholds, and timestamps.
- **Typographic Scale:**
  - Stage / Page Title: `clamp(1.5rem, 2.2vw, 2rem)` (`24px-32px`), `font-semibold`, `tracking-tight` (`-0.025em`).
  - Card Title (`CardTitle`): `15px` (`0.9375rem`), `font-semibold`, `tracking-[-0.015em]`.
  - Body & Table Cell: `13px-14px`, `leading-relaxed`, `#18181B` primary ink and `#52525B` secondary ink.

## 3. Color Tokens & Verified WCAG 2.1 AA Contrast Ratios
All foreground/background pairs were verified with the `antislop-human` WCAG 2.1 relative luminance script:

| Token Role | Foreground Hex | Background Hex | Contrast Ratio | WCAG 2.1 Level |
| :--- | :--- | :--- | :--- | :--- |
| Primary Ink on Canvas | `#18181B` | `#F7F7F4` | **16.65:1** | AAA Pass |
| Primary Ink on White Card | `#18181B` | `#FFFFFF` | **17.74:1** | AAA Pass |
| Secondary Ink on Canvas | `#52525B` | `#F7F7F4` | **7.18:1** | AAA Pass |
| Secondary Ink on White Card | `#52525B` | `#FFFFFF` | **7.65:1** | AAA Pass |
| Muted Ink on White Card | `#71717A` | `#FFFFFF` | **4.83:1** | AA Pass |
| Secondary Ink on Neutral Pill | `#52525B` | `#F1F1EE` | **6.82:1** | AA Pass |
| White Ink on Embossed Primary Button | `#FFFFFF` | `#18181B` | **17.74:1** | AAA Pass |
| White Ink on Terracotta Accent | `#FFFFFF` | `#C84B28` | **4.79:1** | AA Pass |
| Safe Text on White Badge | `#15803D` | `#FFFFFF` | **5.02:1** | AA Pass |
| Warning Text on White Badge | `#B45309` | `#FFFFFF` | **5.02:1** | AA Pass |
| Critical Text on White Badge | `#B91C1C` | `#FFFFFF` | **6.47:1** | AA Pass |

## 4. `shadcn/ui` Component Primitives (`src/components/ui/`)
- `src/components/ui/card.tsx`: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` (`rounded-2xl border border-[#E2E2DE] bg-white`).
- `src/components/ui/button.tsx`: `Button` with variants `default`, `embossed` (tactile dark button from `C:\hellyoshaqiqie`), `terracotta`, `secondary`, `outline`, `ghost`, and `destructive`.
- `src/components/ui/badge.tsx`: Minimalist `Badge` with `dot` prop (`6px` semantic dot inside a clean `#FFFFFF` or `#F7F7F4` pill with `#E2E2DE` border).
- `src/components/ui/table.tsx`: Clean `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` with subtle `#ECECE8` row dividers and `#FAFAF8` hover states.
- `src/components/ui/progress.tsx`: Minimalist `Progress` bar for route risk score (`0-100`) visualization.
