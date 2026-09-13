import { useMemo, useState } from 'react'
import { Panel, MeterRow, Divider, Tag, StatusDot } from '../components/ui/Primitives.jsx'
import { RiskBadge, SeverityTag } from '../components/ui/Badge.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { RiskGauge, Sparkline } from '../components/ui/Gauge.jsx'
import { AreaChartCard } from '../components/ui/Chart.jsx'
import { DataTable, col } from '../components/ui/Table.jsx'
import { STATES } from '../data/states.js'
import { HAZARDS, scoreColor, trendLabel } from '../lib/risk.js'
import { DISASTER_TREND, POLLUTION_TREND } from '../data/analytics.js'
import { SEISMIC, SEISMIC_ZONES, SEISMIC_DISCLAIMER } from '../data/seismic.js'
import { buildDistrictData } from '../data/districts.js'
import { rng } from '../lib/prng.js'
import { useGeoData } from '../store/GeoDataContext.jsx'
import { fmtTime } from '../lib/format.js'

const TABS = [
  { key: 'flood', icon: 'Waves', color: '#2C8CFF' },
  { key: 'fire', icon: 'Flame', color: '#F97316' },
  { key: 'cyclone', icon: 'Tornado', color: '#22D3EE' },
  { key: 'heatwave', icon: 'ThermometerSun', color: '#F97316' },
  { key: 'drought', icon: 'SunDim', color: '#FBBF24' },
  { key: 'airPollution', icon: 'CloudFog', color: '#A855F7' },
  { key: 'earthquake', icon: 'Activity', color: '#EAB308' },
  { key: 'landslide', icon: 'Mountain', color: '#F59E0B' },
]

const ANALYSIS = {
  flood: 'Persistent monsoon trough plus saturated catchments are driving elevated run-off across eastern and peninsular basins. AI anticipates continued inundation risk in low-lying districts through the current window.',
  fire: 'Cumulative fuel load and low humidity are sustaining fire weather across central and south-west hill ranges. Satellites confirm clustered thermal anomalies near forest fringes.',
  cyclone: 'Warm sea-surface anomalies over the Bay of Bengal are favourable for cyclogenesis. Coastal districts should prepare for storm surge and wind damage impacts.',
  heatwave: 'A persistent high-pressure ridge over the north-west is producing extreme daytime maxima. Urban heat-island effects amplify night-time temperatures in metro corridors.',
  drought: 'Rainfall deficit compounding with declining reservoir and soil-moisture indices is raising water-stress across rain-fed belts. Long-duration drought severity is projected to persist.',
  airPollution: 'Temperature inversion and stagnant boundary layers are trapping aerosols over the Indo-Gangetic plain, with stubble-burning upstream contributing episodic peaks.',
  earthquake: 'Seismic monitoring indicates sustained moderate activity along the Himalayan arc and north-east. This module provides monitoring, risk assessment and early notification only.',
  landslide: 'Monsoon-saturated regolith over steep Himalayan and Western Ghats slopes maintains elevated landslide susceptibility. Slope instrumentation shows movement in several sectors.',
}

export default function DisasterIntelligence() {
  const [tab, setTab] = useState('flood')
  const geo = useGeoData()

  const t = TABS.find((x) => x.key === tab)

  const avg = useMemo(() => {
    const s = STATES.reduce((a, st) => a + (st.scores[tab] ?? 0), 0) / STATES.length
    return Math.round(s)
  }, [tab])

  const topStates = useMemo(
    () => [...STATES].sort((a, b) => (b.scores[tab] ?? 0) - (a.scores[tab] ?? 0)).slice(0, 8),
    [tab],
  )

  const series = useMemo(() => hazardSeries(tab), [tab])

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease]">
      {/* hazard tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((h) => (
          <button
            key={h.key}
            onClick={() => setTab(h.key)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-[12px] transition-colors ${tab === h.key ? 'text-ink' : 'text-sub hover:text-ink border-hairline bg-panel/50'}`}
            style={tab === h.key ? { borderColor: h.color, background: `${h.color}14` } : {}}
          >
            <Icon name={h.icon} size={14} style={{ color: h.color }} />
            {HAZARDS[h.key].label}
            {topStates[0] && <span className="font-mono text-[10px]" style={{ color: scoreColor(topStates[0].scores[tab]) }}>{topStates[0].scores[tab]}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* overview */}
        <Panel title={`${HAZARDS[tab].label} Intelligence`} icon={t.icon} bodyClass="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <RiskGauge score={avg} label="NATIONAL AVG" valueColor={scoreColor(avg)} size={110} />
            <div className="space-y-1 flex-1">
              <RiskBadge score={avg} />
              <div className="text-[12px] text-sub leading-relaxed mt-1">{trendLabel(avg)} national trend</div>
              <div className="font-mono text-[11px] text-faint">{topStates.filter((s) => s.scores[tab] >= 75).length} states critical</div>
            </div>
          </div>
          <Divider />
          <div>
            <div className="es-kicker text-faint mb-1.5">AI ANALYSIS</div>
            <p className="text-[12px] text-sub leading-relaxed">{ANALYSIS[tab]}</p>
          </div>
          <Divider />
          <div>
            <div className="es-kicker text-faint mb-2">12-MONTH ACTIVITY</div>
            <AreaChartCard data={series} keys={['v']} colors={{ v: t.color }} height={150} xKey="month" />
          </div>
        </Panel>

        {/* affected regions */}
        <Panel title="Affected Regions" icon="Map" bodyClass="p-2">
          <DataTable
            rowKey="name"
            columns={[
              col('rank', '#', { render: (r, idx) => <span className="font-mono text-[11px] text-faint">{idx + 1}</span>, renderRowIndex: true }),
              col('name', 'State', { render: (r) => <span className="text-ink">{r.label}</span> }),
              col('capital', 'HQ', { render: (r) => <span className="font-mono text-[11px] text-faint">{r.capital}</span> }),
              col('score', 'Score', { render: (r) => <span className="font-mono" style={{ color: scoreColor(r.scores[tab]) }}>{r.scores[tab]}</span> }),
              col('band', 'Level', { render: (r) => <RiskBadge score={r.scores[tab]} /> }),
            ]}
            data={topStates}
          />
        </Panel>

        {/* tab-specific side panel */}
        {tab === 'earthquake' ? <EarthquakePanel /> : tab === 'drought' ? <DroughtPanel topStates={topStates} /> : <HazardSidebar tab={tab} topStates={topStates} />}
      </div>
    </div>
  )
}

function HazardSidebar({ tab, topStates }) {
  return (
    <Panel title="Response Escalation" icon="TrendingUp" bodyClass="p-3 space-y-2.5">
      {topStates.slice(0, 5).map((s) => (
        <MeterRow key={s.name} label={s.label} value={s.scores[tab]} color={scoreColor(s.scores[tab])} icon={HAZARDS[tab].icon} />
      ))}
      <Divider />
      <p className="text-[11px] text-faint leading-relaxed">
        Based on severity bands, auto-escalation to state disaster management authorities is recommended for regions in HIGH or CRITICAL bands.
      </p>
    </Panel>
  )
}

function DroughtPanel({ topStates }) {
  const metrics = useMemo(() => {
    return topStates.slice(0, 5).map((s) => {
      const r = rng('drought|' + s.name)
      return {
        name: s.label,
        anomaly: Math.round((r() - 0.7) * 120),
        reservoir: Math.round(15 + r() * 45),
        soil: Math.round(15 + r() * 45),
        stress: Math.round(40 + r() * 55),
      }
    })
  }, [topStates])
  const droughtStates = metrics.filter((m) => m.anomaly < -20).length
  return (
    <Panel title="Drought Intelligence" icon="SunDim" bodyClass="p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          { l: 'Drought States', v: droughtStates, c: '#FBBF24' },
          { l: 'Rainfall Deficit', v: `${Math.round(metrics.reduce((a, m) => a + m.anomaly, 0) / metrics.length)}%`, c: '#EF4444' },
          { l: 'Avg Reservoir', v: `${Math.round(metrics.reduce((a, m) => a + m.reservoir, 0) / metrics.length)}%`, c: '#22D3EE' },
          { l: 'Water Stress', v: `${Math.round(metrics.reduce((a, m) => a + m.stress, 0) / metrics.length)}%`, c: '#F97316' },
        ].map((x) => (
          <div key={x.l} className="rounded-md border border-hairline bg-panel p-2 text-center">
            <div className="font-display font-bold text-lg" style={{ color: x.c }}>{x.v}</div>
            <div className="es-kicker text-faint">{x.l.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <Divider />
      <div className="space-y-2.5">
        {metrics.map((m) => (
          <div key={m.name} className="rounded border border-hairline bg-panel p-2.5">
            <div className="flex justify-between text-[12px] mb-1.5">
              <span className="text-ink">{m.name}</span>
              <span className={`font-mono ${m.anomaly < -20 ? 'text-critical' : 'text-safe'}`}>{m.anomaly}% rain</span>
            </div>
            <MeterRow label="Reservoir" value={`${m.reservoir}%`} color={m.reservoir < 35 ? '#EF4444' : '#22C55E'} />
            <MeterRow label="Soil Moisture" value={`${m.soil}%`} color={m.soil < 35 ? '#EF4444' : '#EAB308'} />
            <MeterRow label="Water Stress" value={`${m.stress}%`} color={m.stress > 65 ? '#EF4444' : '#F97316'} />
          </div>
        ))}
      </div>
    </Panel>
  )
}

function EarthquakePanel() {
  const exposure = useMemo(() => [...STATES].sort((a, b) => b.scores.earthquake - a.scores.earthquake).slice(0, 6), [])
  return (
    <div className="space-y-3">
      <Panel title="Seismic Events" icon="Activity" bodyClass="p-2">
        <div className="space-y-1">
          {SEISMIC.slice(0, 8).map((e) => (
            <div key={e.id} className="flex items-center gap-2.5 rounded px-2 py-2 hover:bg-raised/50">
              <span className="font-display font-bold text-sm w-9" style={{ color: e.mag >= 5 ? '#EF4444' : e.mag >= 4 ? '#F97316' : '#EAB308' }}>M{e.mag}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-ink truncate">{e.place}</div>
                <div className="text-[10px] font-mono text-faint">{fmtTime(e.time)} • {e.depth}km • {e.source}</div>
              </div>
              {e.felt && <Tag color="#F97316">FELT</Tag>}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="State Exposure Score" icon="MapPin" bodyClass="p-2.5 space-y-2">
        {exposure.map((s) => (
          <MeterRow key={s.name} label={s.label} value={s.scores.earthquake} color={scoreColor(s.scores.earthquake)} icon="Activity" />
        ))}
      </Panel>

      <Panel title="Seismic Zones (BIS IS 1893)" icon="Layers" bodyClass="p-2.5 space-y-2">
        {SEISMIC_ZONES.map((z) => (
          <div key={z.zone} className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: z.color }} />
            <div className="flex-1">
              <div className="text-[12px] text-ink">{z.zone} — {z.level} <span className="font-mono text-[10px] text-faint">({z.pga})</span></div>
              <div className="text-[10px] font-mono text-faint">{z.regions}</div>
            </div>
          </div>
        ))}
      </Panel>

      <div className="rounded-md border border-high/40 bg-panel p-3 flex gap-2.5">
        <Icon name="CircleAlert" size={16} className="text-high shrink-0" />
        <p className="text-[11px] text-sub leading-relaxed">{SEISMIC_DISCLAIMER}</p>
      </div>
    </div>
  )
}

function hazardSeries(tab) {
  if (['flood', 'fire', 'cyclone', 'heatwave', 'earthquake', 'drought', 'landslide'].includes(tab)) {
    return DISASTER_TREND.map((d) => ({ month: d.month, v: d[tab] ?? 0 }))
  }
  if (tab === 'airPollution') return POLLUTION_TREND.map((d) => ({ month: d.month, v: d.aqi }))
  if (tab === 'waterPollution') return POLLUTION_TREND.map((d) => ({ month: d.month, v: d.pm25 }))
  return DISASTER_TREND.map((d, i) => ({ month: d.month, v: Math.round(30 + Math.sin(i) * 8) }))
}