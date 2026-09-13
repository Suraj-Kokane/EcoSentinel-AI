import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Icon } from '../ui/Icon.jsx'
import { IntelligenceDrawer, incidentTypeLabel } from './IntelligenceDrawer.jsx'
import { BASEMAPS, INDIA_BOUNDS, featureBounds, featureName, REPORT_COLORS, INFRA_COLORS, MAG_COLOR } from './mapkit.js'
import { HAZARDS, HAZARD_KEYS, LAYER_CATEGORIES, scoreColor, scoreLabel } from '../../lib/risk.js'
import { overallScore } from '../../lib/risk.js'
import { STATE_MAP, STATES } from '../../data/states.js'
import { buildDistrictData } from '../../data/districts.js'
import { INFRASTRUCTURE, INFRA_CATEGORIES } from '../../data/infrastructure.js'
import { FIRE_HOTSPOTS } from '../../data/satellite.js'
import { useGeoData } from '../../store/GeoDataContext.jsx'
import { useLive } from '../../store/LiveDataContext.jsx'
import { n, fmtTime } from '../../lib/format.js'

function tooltipHTML(st) {
  return `
    <div style="padding:10px 12px;min-width:210px">
      <div style="font-size:9px;letter-spacing:.14em;color:#54719b;font-family:monospace">${st.type.toUpperCase()}</div>
      <div style="font-size:15px;font-weight:700;color:#e6f0ff;font-family:Rajdhani">${st.name}</div>
      <div style="display:flex;gap:6px;margin-top:6px;align-items:center">
        <span style="font-size:11px;color:#8aa6c8">OVERALL</span>
        <span style="font-family:monospace;font-size:12px;color:${st.color}">${st.overall}</span>
        <span style="font-size:9px;padding:1px 6px;border-radius:3px;color:${st.color};background:${st.color}1a;border:1px solid ${st.color}45">${st.band}</span>
      </div>
      <div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:3px 12px;font-size:11px">
        <span style="color:#8aa6c8">Flood <b style="color:${st.floodColor};font-family:monospace">${st.flood}</b></span>
        <span style="color:#8aa6c8">Fire <b style="color:${st.fireColor};font-family:monospace">${st.fire}</b></span>
        <span style="color:#8aa6c8">Cyclone <b style="color:${st.cycColor};font-family:monospace">${st.cyc}</b></span>
        <span style="color:#8aa6c8">AQI <b style="color:${st.aqiColor};font-family:monospace">${st.air}</b></span>
      </div>
      <div style="margin-top:6px;font-size:11px;color:#ef4444;font-family:monospace">▲ ${st.alerts} ACTIVE ALERTS</div>
    </div>`
}

function layerScore(feature, layer, drilled) {
  const { kind, name, state } = featureName(feature)
  if (kind === 'district') {
    const st = STATE_MAP[state]
    const dd = buildDistrictData(st, name)
    return layer === 'overall' ? dd.overall : dd.scores[layer] ?? 0
  }
  const st = STATE_MAP[name]
  if (!st) return 0
  return layer === 'overall' ? st.overall : st.scores[layer] ?? 0
}

function regionInfo(feature, layer, drilled) {
  const { kind, name, state } = featureName(feature)
  const score = layerScore(feature, layer, drilled)
  const color = scoreColor(score)
  const band = scoreLabel(score)
  const base = { type: kind, name, overall: score, color, band, alerts: 0 }
  if (kind === 'district') {
    const st = STATE_MAP[state]
    const dd = buildDistrictData(st, name)
    return { ...base, type: 'district', parent: state, alerts: dd.alerts, flood: dd.scores.flood, fire: dd.scores.fire, cyc: dd.scores.cyclone, air: dd.scores.airPollution, floodColor: scoreColor(dd.scores.flood), fireColor: scoreColor(dd.scores.fire), cycColor: scoreColor(dd.scores.cyclone), aqiColor: scoreColor(dd.scores.airPollution) }
  }
  const st = STATE_MAP[name]
  return { ...base, type: st.type, alerts: st.alerts, flood: st.scores.flood, fire: st.scores.fire, cyc: st.scores.cyclone, air: st.scores.airPollution, floodColor: scoreColor(st.scores.flood), fireColor: scoreColor(st.scores.fire), cycColor: scoreColor(st.scores.cyclone), aqiColor: scoreColor(st.scores.airPollution) }
}

// flies the map when `fly` changes
function FlyController({ fly }) {
  const map = useMap()
  useEffect(() => {
    if (!fly?.bounds) return
    map.flyToBounds(fly.bounds, { padding: [40, 40], maxZoom: fly.maxZoom || 8, duration: 0.8 })
  }, [fly, map])
  return null
}

export function RiskMap({ className = '', showRail = true, drawerMode = 'overlay', initialLayer = 'overall', initialOverlays, onSelect }) {
  const geo = useGeoData()
  const { incidents, seismic } = useLive()

  const [layer, setLayer] = useState(initialLayer)
  const [drilled, setDrilled] = useState(null) // state name to drill districts
  const [drawer, setDrawer] = useState(null) // scope {kind,name,state}
  const [basemap, setBasemap] = useState('dark')
  const [overlays, setOverlays] = useState(initialOverlays || { reports: true, seismic: false, infra: false, fire: false })
  const [fly, setFly] = useState(null)
  const [query, setQuery] = useState('')

  const loading = geo.loading

  const geojson = useMemo(() => {
    if (!geo.statesGeo) return null
    if (!drilled) return geo.statesGeo
    if (!geo.districtsGeo) return null
    const feats = geo.districtsGeo.features.filter((f) => f.properties.NAME_1 === drilled)
    return { type: 'FeatureCollection', features: feats }
  }, [geo, drilled])

  const styleFn = useCallback(
    (feature) => {
      const score = layerScore(feature, layer, drilled)
      const c = scoreColor(score)
      return {
        fillColor: c,
        fillOpacity: 0.72,
        color: score >= 75 ? '#EF4444' : '#2E4E74',
        weight: score >= 75 ? 1.4 : 1,
        opacity: 0.9,
      }
    },
    [layer, drilled],
  )

  const onEachFeature = useCallback(
    (feature, lyr) => {
      const info = regionInfo(feature, layer, drilled)
      lyr.bindTooltip(tooltipHTML(info), { sticky: true, direction: 'top', className: 'es-tooltip', opacity: 1 })
      lyr.on({
        mouseover: (e) => { e.target.setStyle({ weight: 2.5, color: '#22D3EE' }).bringToFront() },
        mouseout: (e) => { L.geoJSON(e.target.feature).resetStyle?.(e.target) ?? e.target.setStyle(styleFn(e.target.feature)) },
        click: () => onPick(feature),
      })
    },
    [layer, drilled, styleFn],
  )

  const onPick = useCallback(
    (feature) => {
      const { kind, name, state } = featureName(feature)
      if (kind === 'district') {
        setDrawer({ kind: 'district', name, state })
      } else {
        setDrawer({ kind: 'state', name })
      }
      onSelect?.({ kind, name, state })
    },
    [onSelect],
  )

  // drill down to a state's districts
  const drill = useCallback(
    (stateName) => {
      const f = geo.stateByName[stateName]
      setDrilled(stateName)
      if (f) setFly({ bounds: featureBounds(f), maxZoom: 8, key: 'state-' + stateName })
    },
    [geo],
  )

  const resetView = useCallback(() => {
    setDrilled(null)
    setDrawer(null)
    if (geo.statesGeo) setFly({ bounds: L.latLngBounds(INDIA_BOUNDS), maxZoom: 6, key: 'india' })
  }, [geo.statesGeo])

  // search
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    const states = STATES.filter((s) => s.name.toLowerCase().includes(q) || s.label.toLowerCase().includes(q))
      .slice(0, 4)
      .map((s) => ({ kind: 'state', name: s.name, label: s.label }))
    const dists = geo.districtList
      ? geo.districtList.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 4).map((d) => ({ kind: 'district', name: d.name, state: d.state, label: `${d.name}, ${d.state}` }))
      : []
    return [...states, ...dists]
  }, [query, geo.districtList])

  const pickSearch = useCallback(
    (r) => {
      setQuery('')
      if (r.kind === 'state') {
        setDrilled(null)
        setDrawer({ kind: 'state', name: r.name })
        const f = geo.stateByName[r.name]
        if (f) setFly({ bounds: featureBounds(f), maxZoom: 8, key: 's-' + r.name })
      } else {
        setDrilled(r.state)
        setDrawer({ kind: 'district', name: r.name, state: r.state })
        const f = geo.districtList?.find((d) => d.name === r.name && d.state === r.state)?.feature
        if (f) setFly({ bounds: featureBounds(f), maxZoom: 9, key: 'd-' + r.name })
      }
    },
    [geo],
  )

  const toggleOverlay = (k) => setOverlays((o) => ({ ...o, [k]: !o[k] }))

  return (
    <div className={`relative overflow-hidden rounded-md border border-hairline ${className}`} style={{ minHeight: 380 }}>
      {loading && (
        <div className="absolute inset-0 z-[600] grid place-items-center bg-abyss">
          <div className="flex flex-col items-center gap-2 text-sub">
            <Icon name="Loader2" size={22} className="animate-spin text-electric" />
            <span className="es-kicker">LOADING GEOSPATIAL GRID…</span>
          </div>
        </div>
      )}

      <MapContainer
        center={[22.5, 79.5]}
        zoom={5}
        zoomControl={false}
        minZoom={4}
        maxZoom={10}
        maxBounds={L.latLngBounds(INDIA_BOUNDS)}
        maxBoundsViscosity={0.8}
        style={{ height: '100%', width: '100%', minHeight: 380 }}
        className="relative z-0"
      >
        <TileLayer key={basemap} url={BASEMAPS[basemap].url} attribution={BASEMAPS[basemap].attribution} subdomains={basemap === 'dark' ? 'abcd' : 'abc'} />
        <ZoomControl position="topright" />
        <FlyController fly={fly} />

        {geojson && (
          <GeoJSON key={`${drilled || 'india'}-${layer}`} data={geojson} style={styleFn} onEachFeature={onEachFeature} />
        )}

        {/* citizen report markers */}
        {overlays.reports &&
          incidents.map((i) => (
            <CircleMarker key={i.id} center={[i.lat, i.lng]} pathOptions={{ color: REPORT_COLORS[i.type], fillColor: REPORT_COLORS[i.type], fillOpacity: 0.32, weight: 1.5 }} radius={6}>
              <Popup>
                <IncidentPopup i={i} />
              </Popup>
            </CircleMarker>
          ))}

        {/* seismic epicenter markers */}
        {overlays.seismic &&
          seismic.map((e) => (
            <CircleMarker key={e.id} center={[e.lat, e.lng]} pathOptions={{ color: MAG_COLOR(e.mag), fillColor: MAG_COLOR(e.mag), fillOpacity: 0.25, weight: 1.5 }} radius={Math.max(4, e.mag * 3.2)}>
              <Popup>
                <div className="p-2.5 min-w-[160px]">
                  <div className="font-display font-bold text-sm">M{e.mag}</div>
                  <div className="text-[11px] text-ink">{e.place}</div>
                  <div className="text-[10px] font-mono text-faint mt-1">{e.source} • {e.depth} km deep</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* infrastructure asset markers */}
        {overlays.infra &&
          INFRASTRUCTURE.map((a) => (
            <CircleMarker key={a.id} center={[a.lat, a.lng]} pathOptions={{ color: INFRA_COLORS[a.category], fillColor: INFRA_COLORS[a.category], fillOpacity: 0.35, weight: 1.2 }} radius={5}>
              <Popup>
                <div className="p-2.5 min-w-[170px]">
                  <div className="font-display font-bold text-sm text-ink">{a.name}</div>
                  <div className="text-[11px] text-sub">{INFRA_CATEGORIES.find((c) => c.key === a.category)?.label} • {a.district}</div>
                  <div className="text-[10px] font-mono mt-1" style={{ color: scoreColor(a.risk) }}>Exposure {a.risk}/100 · {a.tier.toUpperCase()}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* fire hotspots */}
        {overlays.fire &&
          FIRE_HOTSPOTS.map((h, i) => (
            <CircleMarker key={i} center={[h.lat, h.lng]} pathOptions={{ color: '#F97316', fillColor: '#EF4444', fillOpacity: 0.4, weight: 1.2 }} radius={5.5 + h.intensity / 40}>
              <Popup>
                <div className="p-2.5 min-w-[150px]">
                  <div className="font-display font-bold text-sm text-ink">Fire Hotspot</div>
                  <div className="text-[11px] text-sub">{h.region}</div>
                  <div className="text-[10px] font-mono text-faint mt-1">Intensity {h.intensity} · confidence {h.confidence}%</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* vignette */}
      <div className="es-vignette" />

      {/* layer rail */}
      {showRail && <LayerRail layer={layer} setLayer={setLayer} overlays={overlays} toggleOverlay={toggleOverlay} />}

      {/* search */}
      <SearchBox query={query} setQuery={setQuery} results={results} pick={pickSearch} />

      {/* legend */}
      <Legend layer={layer} />

      {/* basemap + reset controls */}
      <div className="absolute bottom-3 right-20 z-[500] flex flex-col gap-1.5">
        <button onClick={resetView} className="grid place-items-center h-8 w-8 rounded-md border border-hairline bg-panel/90 text-sub hover:text-ink" title="Reset view">
          <Icon name="Home" size={15} />
        </button>
        <button onClick={() => setBasemap((b) => (b === 'dark' ? 'light' : 'dark'))} className="grid place-items-center h-8 w-8 rounded-md border border-hairline bg-panel/90 font-mono text-[9px] text-sub hover:text-ink" title="Toggle basemap">
          {basemap === 'dark' ? 'DK' : 'OSM'}
        </button>
      </div>

      {/* intelligence drawer */}
      {drawer && (
        <IntelligenceDrawer scope={drawer} onClose={() => setDrawer(null)} onDrill={drawer.kind === 'state' ? drill : undefined} />
      )}
    </div>
  )
}

function LayerRail({ layer, setLayer, overlays, toggleOverlay }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="absolute top-3 left-3 z-[500] w-[196px]">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 w-full rounded-t-md border border-hairline bg-panel/95 px-2.5 py-2 text-left">
        <Icon name="Layers" size={14} className="text-electric" />
        <span className="es-title flex-1">HAZARD LAYERS</span>
        <Icon name="ChevronRight" size={13} className={`text-faint transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="rounded-b-md border border-t-0 border-hairline bg-panel/95 backdrop-blur p-1.5 space-y-1.5 max-h-[300px] overflow-y-auto">
          <LayerButton active={layer === 'overall'} onClick={() => setLayer('overall')} icon="Radar" label="Overall Risk" color="#22D3EE" />
          {LAYER_CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <div className="px-1.5 pt-1 pb-0.5 text-[8px] font-mono tracking-[0.14em] text-faint/70">{cat.label.toUpperCase()}</div>
              {HAZARD_KEYS.filter((k) => HAZARDS[k].cat === cat.key).map((k) => (
                <LayerButton key={k} active={layer === k} onClick={() => setLayer(k)} icon={HAZARDS[k].icon} label={HAZARDS[k].label} color="#8AA6C8" />
              ))}
            </div>
          ))}
          <div className="es-hairline pt-1.5">
            <div className="px-1.5 pb-0.5 text-[8px] font-mono tracking-[0.14em] text-faint/70">OVERLAYS</div>
            <OverlayToggle label="Citizen Reports" on={overlays.reports} onClick={() => toggleOverlay('reports')} />
            <OverlayToggle label="Seismic Events" on={overlays.seismic} onClick={() => toggleOverlay('seismic')} />
            <OverlayToggle label="Infrastructure" on={overlays.infra} onClick={() => toggleOverlay('infra')} />
            <OverlayToggle label="Fire Hotspots" on={overlays.fire} onClick={() => toggleOverlay('fire')} />
          </div>
        </div>
      )}
    </div>
  )
}

function LayerButton({ active, onClick, icon, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full rounded px-2 py-1.5 text-[12px] text-left transition-colors ${active ? 'bg-electric/15 text-ink' : 'text-sub hover:text-ink hover:bg-raised/50'}`}
      style={active ? { boxShadow: 'inset 0 0 0 1px rgba(44,140,255,0.4)' } : {}}
    >
      <Icon name={icon} size={14} style={{ color: active ? '#2C8CFF' : '#54719B' }} />
      <span className="flex-1 truncate">{label}</span>
      {active && <span className="h-1.5 w-1.5 rounded-full bg-electric" />}
    </button>
  )
}

function OverlayToggle({ label, on, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 w-full rounded px-2 py-1.5 text-[12px] text-sub hover:text-ink hover:bg-raised/50">
      <span className={`h-3 w-1.5 rounded-sm transition-colors ${on ? 'bg-electric' : 'bg-hairline'}`} />
      {label}
    </button>
  )
}

function SearchBox({ query, setQuery, results, pick }) {
  const [focus, setFocus] = useState(false)
  return (
    <div className="absolute top-3 left-[216px] right-3 z-[500] sm:right-auto sm:w-[260px] md:w-[300px]">
      <div className="flex items-center gap-2 rounded-md border border-hairline bg-panel/95 px-2.5 py-2">
        <Icon name="Search" size={15} className="text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          placeholder="Search state or district…"
          className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-faint outline-none"
        />
      </div>
      {focus && results.length > 0 && (
        <div className="mt-1 rounded-md border border-hairline bg-deep/95 shadow-2xl overflow-hidden">
          {results.map((r) => (
            <button
              key={r.kind + r.name}
              onMouseDown={() => pick(r)}
              className="flex items-center gap-2 w-full px-2.5 py-2 text-left text-[12px] text-sub hover:bg-raised/60 hover:text-ink"
            >
              <Icon name={r.kind === 'state' ? 'Map' : 'Layers'} size={13} className="text-faint" />
              <span>{r.label}</span>
              <span className="ml-auto font-mono text-[9px] text-faint uppercase">{r.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Legend({ layer }) {
  const label = layer === 'overall' ? 'Overall Risk' : HAZARDS[layer]?.label || layer
  const steps = [
    { l: 'Safe', c: '#22C55E', r: '0–35' },
    { l: 'Moderate', c: '#EAB308', r: '35–55' },
    { l: 'High', c: '#F97316', r: '55–75' },
    { l: 'Critical', c: '#EF4444', r: '75+' },
  ]
  return (
    <div className="absolute bottom-3 left-3 z-[500] rounded-md border border-hairline bg-panel/95 px-3 py-2">
      <div className="es-kicker mb-1.5 text-faint">{label.toUpperCase()} — RISK SCALE</div>
      <div className="flex items-center gap-3">
        {steps.map((s) => (
          <div key={s.l} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.c }} />
            <span className="text-[10px] text-sub">{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function IncidentPopup({ i }) {
  return (
    <div className="p-3 min-w-[200px] max-w-[240px]">
      <div className="flex items-center gap-2">
        <span className="rounded px-1.5 py-0.5 font-mono text-[9px]" style={{ color: REPORT_COLORS[i.type], background: `${REPORT_COLORS[i.type]}1a`, border: `1px solid ${REPORT_COLORS[i.type]}45` }}>
          {incidentTypeLabel(i.type).toUpperCase()}
        </span>
        <span className="text-[10px] font-mono text-faint">{fmtTime(i.time)}</span>
      </div>
      <div className="mt-1.5 text-[13px] font-medium text-ink leading-snug">{i.title}</div>
      <div className="mt-1 text-[11px] text-sub leading-snug">{i.desc}</div>
      <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px] font-mono text-faint">
        <span>{i.district}</span>
        <span className="text-right">AI conf. {Math.round(i.confidence * 100)}%</span>
      </div>
    </div>
  )
}

export { overallScore }