import { useMemo } from 'react'
import { RiskMap } from '../components/map/RiskMap.jsx'
import { Panel, Tag, Stat, Divider } from '../components/ui/Primitives.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { ProgressBar } from '../components/ui/Primitives.jsx'
import { STATES } from '../data/states.js'
import { FLOOD_EXTENTS, FIRE_HOTSPOTS, WATER_BODIES, SATELLITE_SOURCES, ndviFor } from '../data/satellite.js'
import { scoreColor } from '../lib/risk.js'
import { fmtTime, n } from '../lib/format.js'

export default function SatelliteIntelligence() {
  const ndvi = useMemo(() => [...STATES].map((s) => ({ name: s.label, value: ndviFor(s.name) })).sort((a, b) => b.value - a.value), [])
  const lowNvdi = ndvi.slice(-6).reverse()

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="es-title">SATELLITE DATA SOURCES</span>
        {SATELLITE_SOURCES.map((s) => (
          <Tag key={s.key} color="#22C55E">
            <Icon name="Satellite" size={11} /> {s.label} · {s.status}
          </Tag>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Panel bodyClass="p-3">
          <Stat label="Active Fire Hotspots" value={FIRE_HOTSPOTS.length} color="#F97316" />
          <div className="text-[10px] font-mono text-faint mt-1">NASA FIRMS-class</div>
        </Panel>
        <Panel bodyClass="p-3">
          <Stat label="Flood Extent" value={n(FLOOD_EXTENTS.reduce((a, e) => a + e.area, 0))} unit="km²" color="#2C8CFF" />
          <div className="text-[10px] font-mono text-faint mt-1">water mapping</div>
        </Panel>
        <Panel bodyClass="p-3">
          <Stat label="Monitored Water Bodies" value={WATER_BODIES.length} color="#22D3EE" />
          <div className="text-[10px] font-mono text-faint mt-1">Sentinel-class</div>
        </Panel>
        <Panel bodyClass="p-3">
          <Stat label="Mean NDVI" value={ndvi.length ? ndvi[Math.floor(ndvi.length / 2)].value.toFixed(2) : '0.00'} color="#22C55E" />
          <div className="text-[10px] font-mono text-faint mt-1">vegetation health</div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* hotspots map */}
        <Panel title="Fire Hotspot Clusters" icon="Flame" bodyClass="p-3 space-y-2" className="xl:col-span-1">
          {FIRE_HOTSPOTS.map((h) => (
            <div key={h.region} className="rounded border border-hairline bg-panel p-2.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-ink">{h.region}</span>
                <span className="font-mono text-critical">{h.intensity}</span>
              </div>
              <ProgressBar value={h.intensity} color="#F97316" height={5} className="mt-1.5" />
              <div className="text-[10px] font-mono text-faint mt-1">conf. {h.confidence}% • {fmtTime(h.detected)}</div>
            </div>
          ))}
        </Panel>

        {/* flood extent */}
        <Panel title="Flood Extent Monitoring" icon="Waves" bodyClass="p-2.5 space-y-2">
          {FLOOD_EXTENTS.map((f) => (
            <div key={f.region} className="flex items-center gap-3 rounded border border-hairline bg-panel p-2.5">
              <Icon name="Waves" size={16} className="text-electric shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-ink truncate">{f.region}</div>
                <div className="text-[10px] font-mono text-faint">{fmtTime(f.date)}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-sm text-electric">{n(f.area)} km²</div>
                <div className="text-[9px] font-mono" style={{ color: scoreColor(f.severity * 25) }}>SEV-{f.severity}</div>
              </div>
            </div>
          ))}
        </Panel>

        {/* water bodies */}
        <Panel title="Water Body Monitoring" icon="Droplets" bodyClass="p-2.5 space-y-2">
          {WATER_BODIES.map((w) => (
            <div key={w.name} className="rounded border border-hairline bg-panel p-2.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-ink">{w.name}</span>
                <span className="font-mono" style={{ color: w.level < 40 ? '#EF4444' : '#22D3EE' }}>{w.level}%</span>
              </div>
              <div className="text-[10px] font-mono text-faint">{w.state} • {w.area} km²</div>
              <ProgressBar value={w.level} color={w.level < 40 ? '#EF4444' : '#22D3EE'} height={5} className="mt-1.5" />
            </div>
          ))}
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Panel title="Vegetation Health — NDVI (top)" icon="Gauge" bodyClass="p-2.5 space-y-2">
          {ndvi.slice(0, 7).map((d) => (
            <div key={d.name} className="grid grid-cols-[130px_1fr_44px] items-center gap-2">
              <span className="text-[12px] text-sub truncate">{d.name}</span>
              <ProgressBar value={d.value * 100} color="#22C55E" height={6} />
              <span className="font-mono text-[11px] text-right text-ink">{d.value.toFixed(2)}</span>
            </div>
          ))}
        </Panel>

        <Panel title="Deforestation Indicators (low NDVI)" icon="TrendingDown" bodyClass="p-2.5 space-y-2">
          {lowNvdi.map((d) => (
            <div key={d.name} className="grid grid-cols-[130px_1fr_44px] items-center gap-2">
              <span className="text-[12px] text-sub truncate">{d.name}</span>
              <ProgressBar value={d.value * 100} color={d.value < 0.45 ? '#EF4444' : '#F97316'} height={6} />
              <span className="font-mono text-[11px] text-right text-ink">{d.value.toFixed(2)}</span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  )
}