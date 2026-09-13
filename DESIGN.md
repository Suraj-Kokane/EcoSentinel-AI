# ECOSENTINEL AI — Design System & Architecture

> *"India's AI-Powered Environmental Intelligence & Disaster Prevention Network"*

A national-scale, multi-hazard environmental intelligence platform built to the visual and functional standard of **Palantir Gotham · NASA Mission Control · ISRO Control Centre · NDMA Command Center**. Designed for adoption by NDMA, ISRO, IMD, State Disaster Management Authorities, Pollution Control Boards, Forest Departments and government command centers — *not* a student-project dashboard.

---

## 1. Design Direction

| Principle | Rule |
|---|---|
| Aesthetic | Flat, dense, enterprise ops-console. No glassmorphism, no pastel gradients, no "startup" styling. |
| Surfaces | Deep navy-black stack with 1px hairline borders and subtle inset glows. |
| Information density | Command-center grade — many KPIs, always-glanceable, mono telemetry. |
| Motion | Restrained: fade-up entrances, pulsing status dots, a slow scan-line sweep on hero elements. |
| Typography | Rajdhani (display numerals) + Inter (UI) + JetBrains Mono (telemetry/timestamps). |
| Color | Risk is always semantically mapped: **Green = Safe · Yellow = Moderate · Orange = High · Red = Critical**. |

---

## 2. Color System

**Surface stack**
```
abyss    #04070E   page background
deep     #060D1A   sidebar / topbar
panel    #0A1526   cards & panels
raised   #0E2038   hover / raised
hairline #16304F   1px borders
edge     #1E3A5F   active border
```

**Brand / accents**
```
electric #2C8CFF   primary interaction
cyanx    #22D3EE   secondary highlight
```

**Risk scale (single source of truth — `src/lib/risk.js`)**
```
safe     #22C55E   score 0–34    SAFE
moderate #EAB308   score 35–54   MODERATE
high     #F97316   score 55–74   HIGH
critical #EF4444   score 75–100  CRITICAL
```

**Text**
```
ink   #E6F0FF primary   sub #8AA6C8 secondary   faint #54719B tertiary
```

Every risk score, badge, gauge and map fill **derives its color from one function** (`scoreColor(score)`), guaranteeing the whole platform is visually consistent.

---

## 3. Typography System

| Role | Family | Weight | Notes |
|---|---|---|---|
| Display numerals / headings | **Rajdhani** | 500–700 | Command-console character |
| Body / UI | **Inter Variable** | 400–600 | Legibility at density |
| Telemetry / timestamps / IDs | **JetBrains Mono** | 400–600 | `14:32:07 IST`, `ALT-104` |

Scale: `9px` eyebrow/uppercase labels → `30px` KPI numerals. Uppercase labels use `letter-spacing 0.12–0.18em`.

---

## 4. Information Architecture

**Left sidebar** (collapsible to icon rail — groups, not reshuffles of the original spec):

```
OVERVIEW        Dashboard (/)
                Environmental Intelligence (/environmental)
                National Risk Map (/risk-map)
                Satellite Intelligence (/satellite-intelligence)
INTELLIGENCE    AI Prediction Center (/ai-prediction)
                Disaster Intelligence (/disasters)
                Analytics (/analytics)
FIELD           Citizen Reports (/citizen-reports)
                IoT Monitoring (/iot)
                Infrastructure (/infrastructure)
OPERATIONS      Alert Center (/alerts)
                Authority Command Center (/command-center)
SYSTEM          Settings (/settings)
```

**Top command bar**: page title · National Threat Level pill · live IST clock (ticks every ~2.6s) · active-alert counter · operator avatar.

---

## 5. The Map Engine (centerpiece, ~60% of dashboard)

Built on **react-leaflet + Leaflet + OpenStreetMap** (CARTO *Dark Matter* tiles — OSM data rendered dark; standard OSM retained as a one-click toggle). India state + district boundaries are bundled and simplified locally (`public/data/`) so the demo never depends on live network for the choropleth.

- **12 hazard layers**: Overall + Flood · Cyclone · Heatwave · Cold Wave (Meteorological) · Earthquake · Landslide (Geological) · Forest Fire · Air · Water · Drought (Environmental) · Infrastructure.
- **Choropleth recolor** is instant on layer switch (style function keyed to hazard).
- **Hover** → government-style sticky tooltip (state, overall score, flood/fire/cyclone/AQI rows, active-alert count).
- **Click** → right-side **AI Intelligence Drawer**: risk + EHI gauges, 12-hazard breakdown, recent alerts, citizen reports, AI recommendation, Emergency Priority Score, and an **AI Resource Deployment** block.
- **Drill-down**: clicking a state loads its **district choropleth** (594 districts, rendered only on demand); district click opens district-scoped telemetry (rainfall anomaly, reservoir, soil moisture, water stress).
- **Search** matches states *and* districts; selection flys-to bounds, highlights, and opens the drawer.
- **Overlay toggles**: Citizen Reports · Seismic Epicenters · Infrastructure Assets · Fire Hotspots.
- *No reliance on an external map in a way that breaks offline — the choropleth is fully local.*

---

## 6. AI Prediction Center

Chat-style (Palantir AIP × ChatGPT) but **data-driven and deterministic** — responses are composed from the live mock dataset, so queries about different states produce genuinely different, internally-consistent answers (no external LLM, zero cost/demo risk).

- **Forecast windows**: Current · 24 Hours · 3 Days · 7 Days · 30 Days (scales every hazard projection).
- Per-hazard output: projected score gauge, **confidence %**, drift (Worsening/Stable/Improving), key risk factors, recommended actions, and a prediction timeline chart.

---

## 7. Environmental Health Index (EHI)

Explainable 0–100 composite shown at **national, state and district** scope:

```
EHI = 0.25·AirQuality
    + 0.20·WaterQuality
    + 0.25·(100 − DisasterRisk)     ← mean of 8 geophysical hazards
    + 0.15·VegetationHealth         ← derived from fire + drought pressure
    + 0.15·TemperatureStability     ← derived from heat/cold anomalies
```

Grades: **Healthy (80+) · Good (65+) · Moderate (50+) · Stressed (35+) · Critical (<35)**.

---

## 8. AI Resource Deployment Engine

Deterministic rules matrix `(hazard, severity band, population exposure) → asset counts`:

```
NDRF teams · Fire brigades · Ambulances · Relief camps · Medical teams
severity multiplier: SAFE 0.5x → CRITICAL 3.0x
exposure factor: 1 + log10(popLakh/10) capped [0.6, 3.0]
```

Surfaced in the state/district drawer and the Authority Command Center as ranked deployment suggestions (P0 IMMEDIATE → P3 MONITOR).

---

## 9. Earthquake Module — Compliance Rules

**Monitoring only. No prediction — ever.**

- Language locked to: *Monitoring · Risk Assessment · Early Notification*.
- The word "prediction" does not appear in seismic UI.
- Fixed banner: *"Earthquakes cannot currently be predicted…"*.
- Sources attributed: **National Center for Seismology (NCS)** and **USGS Earthquake Feed**.
- Content: active events feed, magnitude timeline, Zone II–V classification (BIS IS 1893), state exposure ranking.

---

## 10. Page Wireframes (ASCII)

```text
┌─────────── NAV ───────────────┬─────────────── COMMAND BAR ───────────────────┐
│ ▢ ECOSENTINEL AI              │  Dashboard   [THREAT: ELEVATED] [⚑ 27] 14:32:07│
│ ─ OVERVIEW                    ├────────────────────────────────────────────────┤
│  ▒ Dashboard                  │ KPI│KPI│KPI│KPI│KPI│KPI                        │
│  ▸ Environmental              │ ─ National EHI strip ───────────────────────── │
│  ▸ National Risk Map          │ ┌──────── NAV.ST. MAP (60%) ────────┐┌ PANEL ┐ │
│  ▸ Satellite                  │ │ LAYERS│                │SEARCH   ││Critical│ │
│ ─ INTELLIGENCE                │ │ Flood │      INDIA    │         ││ Flood  │ │
│  ▸ AI Prediction              │ │ Fire  │   (choropleth)│ [DRAWER]││ Fire   │ │
│  ▸ Disaster                   │ └─────────────────────────┘└────────┘│ Live   │ │
│  ▸ Analytics                  │ ─ environment/disaster/satellite panels ────── │
│ ─ FIELD / OPERATIONS / SYSTEM │                                                │
└───────────────────────────────┴────────────────────────────────────────────────┘
```

Command Center (3-column ops wall):
```text
[ LIVE INCIDENT FEED ]  [ CRITICAL DISTRICTS ]  [ RESPONSE TEAMS ]
                        [ INFRA AT RISK       ]  [ RESOURCE ALLOCATION ]
                        [ NDRF DEPLOY SUGGEST ]  [ RELIEF CAMP SUGGEST ]
──────────── [ NATIONAL SITUATION MAP ] ──────────────────────────────
```

---

## 11. Component System

`src/components/`
- `ui/` — `Panel` (corner-bracket frames), `KpiCard`, `RiskBadge`/`SeverityTag`/`ThreatPill`/`OnlinePill`/`TrendPill`, `RiskGauge`/`EhiGauge`/`Sparkline`/`Bars`, `ChartCard` + themed Recharts wrappers (`AreaChartCard`, `LineChartCard`, `BarChartCard`, `RadialGaugeChart`, `DonutChart`), `DataTable`/`col`, `MeterRow`, `ProgressBar`, `Icon`.
- `map/` — `RiskMap` (engine), `IntelligenceDrawer`, `mapkit`.
- `layout/` — `Sidebar`, `Topbar`, `Layout`.
- `report/` — `IncidentClassify` (simulated AI upload classifier).

---

## 12. Live Simulation

`LiveDataContext` ticks every ~2.6s: drifts IoT telemetry (battery/RSSI/readings), updates the IST clock, and occasionally emits a new alert from a curated pool — so a judge leaving the Command Center open sees **genuinely new** activity. All derived KPIs stay consistent with the dataset.

---

## 13. Responsiveness

- **Desktop (xl)**: full sidebar + map hero (60%) + right rail.
- **Tablet (lg)**: sidebar collapses to icon rail; stacked grids.
- **Mobile**: sidebar becomes an overlay drawer; KPI cards stack to 2-col; the Intelligence Drawer becomes a full-width sheet; all grids collapse to single column.

---

## 14. Design Rationale

1. **Semantic color as cognition** — risk color flows from a single `scoreColor()` source, so a red state on the map is red in the drawer, the KPI, and the analytics ranking. Trust through consistency.
2. **Dark ops-console to reduce glare in 24×7 control rooms** and to make the risk palette pop.
3. **Real geography** — actual Indian state/district boundaries (not a hand-drawn blob) so judges recognize it instantly and it scales to real GIS feeds.
4. **Explainable AI** — EHI and deployment counts use transparent weighted formulas, letting reviewers audit *why* a recommendation exists (a differentiator for government trust).
5. **Offline-resilient demo** — choropleth + all data are local; only the optional tile imagery needs network, so the demo never fails in a packed hackathon hall.