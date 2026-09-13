# EcoSentinel AI

**India's AI-Powered Environmental Intelligence & Disaster Prevention Network**

A national-scale, multi-hazard environmental intelligence platform — built for the Smart India Hackathon (Hardware category). Designed to the standard of Palantir Gotham, NASA Mission Control, ISRO Control Centre and NDMA Command Center.

> See **`DESIGN.md`** for the full design system, architecture, color/typography systems, and design rationale.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build
npm run preview
```

**Demo-ready on any network** — the India state/district choropleth and all data are bundled locally (`public/data/`), so the core map works even if demo-hall WiFi fails. Only the optional map tiles (dark OSM) need internet.

---

## Demo Script (60–90s for judges)

1. **Dashboard** — National Threat Level, six live KPI cards, the **Environmental Health Index (EHI)** strip, and the hero **India risk map** (~60% of the screen).
2. On the map: **hover** a state → gov tooltip; **click** a state → AI Intelligence Drawer with risk/EHI gauges, 12-hazard breakdown, AI recommendation and resource deployment.
3. **Search** "Maharashtra" → map flies to the state. Click *District-level intelligence* → drill into district choropleth (rainfall anomaly, reservoir, soil moisture, water stress).
4. **Switch hazard layers** (Flood → Drought → Infrastructure…) → instant recolor.
5. **Authority Command Center** — live incident feed (watch it update), critical districts, NDRF deployment suggestions, relief-camp suggestions, resource allocation.
6. **AI Prediction Center** — run *"What risks should Maharashtra prepare for this week?"* and cycle forecast windows (24H / 3D / 7D / 30D).
7. **Disaster Intelligence** → **Drought** and **Earthquake** tabs (note the "monitoring, not prediction" compliance banner).
8. **Infrastructure** and **Satellite Intelligence** — asset exposure + NDVI / flood-extent / fire-hotspot panels.
9. **IoT Monitoring** — live ESP32 mesh topology with battery/signal telemetry.
10. **Citizen Reports** — upload an image → simulated AI classification (flood/fire/pollution/landslide).

---

## What it monitors & predicts

Floods · Forest Fires · Cyclones · Landslides · Air Pollution · Water Pollution · Heatwaves · Cold Waves · **Drought** · **Earthquakes** *(monitoring + early notification only — no prediction claims)* · **Critical Infrastructure** exposure.

Combines: AI Prediction Engine · IoT (ESP32) Sensor Network · Satellite Intelligence · Citizen Reporting · GIS Mapping · Disaster Analytics.

---

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 18/19 + Vite |
| Styling | Tailwind CSS (custom dark navy theme) |
| Map | react-leaflet + Leaflet + OpenStreetMap (CARTO Dark) · bundled India GeoJSON |
| Charts | Recharts |
| Routing | react-router-dom |
| Icons / fonts | lucide-react · Inter · Rajdhani · JetBrains Mono |

---

## Structure

```
public/data/            india-states.geojson · india-districts.geojson (simplified)
src/lib/                risk engine · EHI · deployment · AI answer generator · PRNG
src/data/               states · districts gen · alerts · incidents · iot · seismic ·
                        satellite · infrastructure · analytics · teams · live pool
src/store/              GeoDataContext · LiveDataContext (live ticker)
src/components/         ui primitives · map engine · layout · report classifier
src/pages/              13 routed pages
scripts/fetch-geo.mjs   one-time GeoJSON fetch + simplify utility
```