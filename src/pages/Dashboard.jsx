import { useMemo } from 'react'
import { RiskMap } from '../components/map/RiskMap.jsx'
import { KpiCard } from '../components/ui/KpiCard.jsx'
import { Panel, MeterRow, Divider } from '../components/ui/Primitives.jsx'
import { RiskBadge, SeverityTag } from '../components/ui/Badge.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { STATES, nationalAggregate } from '../data/states.js'
import { HAZARDS, scoreColor, HAZARD_KEYS } from '../lib/risk.js'
import { nationalEHI, ehiGrade } from '../lib/ehi.js'
import { useLive } from '../store/LiveDataContext.jsx'
import { fmtTime } from '../lib/format.js'

export default function Dashboard() {
  const { alerts, incidents } = useLive()
  const agg = nationalAggregate()

  const stats = useMemo(() => {
    const floodAreas = STATES.filter((s) => s.scores.flood >= 55).length
    const fireAreas = STATES.filter((s) => s.scores.fire >= 55).length
    const avg = STATES.reduce((a, s) => a + s.overall, 0) / STATES.length
    const threat = avg >= 70 ? { level: 'SEVERE', color: '#EF4444' } : avg >= 52 ? { level: 'ELEVATED', color: '#F97316' } : avg >= 38 ? { level: 'GUARDED', color: '#EAB308' } : { level: 'NORMAL', color: '#22C55E' }
    return { floodAreas, fireAreas, threat, ehi: nationalEHI(STATES) }
  }, [])

  const ehGrade = ehiGrade(stats.ehi)
  const activeAlerts = alerts.filter((a) => a.status === 'active').length

  // watch lists
  const floodWatch = [...STATES].filter((s) => s.scores.flood >= 70).sort((a, b) => b.scores.flood - a.scores.flood).slice(0, 3)
  const fireWatch = [...STATES].filter((s) => s.scores.fire >= 70).sort((a, b) => b.scores.fire - a.scores.fire).slice(0, 3)

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease]">
      {/* KPI band */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="National Threat" value={stats.threat.level} accent={stats.threat.color} icon="Radar" trend={Math.round(stats.ehi)} trendDir="down" sub={`Avg state risk ${Math.round(STATES.reduce((a, s) => a + s.overall, 0) / STATES.length)}/100`} />
        <KpiCard label="Critical States" value={agg.critical} accent="#EF4444" icon="TriangleAlert" sub={`${agg.high} states on high alert`} />
        <KpiCard label="Active Alerts" value={activeAlerts} accent="#F97316" icon="Bell" sub="Live across 35 regions" />
        <KpiCard label="Flood Risk Areas" value={stats.floodAreas} accent="#2C8CFF" icon="Waves" sub="Districts above danger mark" />
        <KpiCard label="Fire Risk Areas" value={stats.fireAreas} accent="#F97316" icon="Flame" sub="Forest + stubble hotspots" />
        <KpiCard label="Citizen Reports" value={incidents.length} accent="#22D3EE" icon="MessageSquare" sub="AI-classified incidents" />
      </div>

      {/* National EHI strip */}
      <Panel title="National Environmental Health Index" icon="Gauge" bodyClass="p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <div className="font-display font-bold text-5xl leading-none" style={{ color: ehGrade.color }}>{stats.ehi}</div>
              <div className="es-kicker mt-1">/ 100</div>
            </div>
            <div>
              <div className="font-display font-bold text-lg" style={{ color: ehGrade.color }}>{ehGrade.label}</div>
              <div className="text-[11px] text-sub max-w-[190px] leading-snug">Composite of air, water, disaster resilience, vegetation & temperature stability.</div>
            </div>
          </div>
          <Divider className="md:!hidden" />
          <div className="flex-1 space-y-2">
            {[
              { k: 'Air Quality', v: Math.round(100 - STATES.reduce((a, s) => a + s.scores.airPollution, 0) / STATES.length) },
              { k: 'Water Quality', v: Math.round(100 - STATES.reduce((a, s) => a + s.scores.waterPollution, 0) / STATES.length) },
              { k: 'Disaster Resilience', v: Math.round(100 - STATES.reduce((a, s) => a + s.overall, 0) / STATES.length) },
              { k: 'Vegetation Health', v: Math.round(100 - STATES.reduce((a, s) => a + s.scores.fire * 0.5 + s.scores.drought * 0.5, 0) / STATES.length) },
              { k: 'Temperature Stability', v: Math.round(100 - STATES.reduce((a, s) => a + (s.scores.heatwave + s.scores.coldWave) / 2, 0) / STATES.length) },
            ].map((r) => (
              <div key={r.k} className="grid grid-cols-[150px_1fr_42px] md:grid-cols-[150px_minmax(160px,1fr)_42px] items-center gap-3">
                <span className="text-[11px] text-sub">{r.k}</span>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: scoreColor(100 - r.v) }} />
                </div>
                <span className="font-mono text-[11px] text-ink text-right">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Map hero + right rail */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-3">
        <RiskMap className="h-[560px] xl:h-[600px]" />

        <div className="space-y-3">
          <Panel title="Critical States" icon="TriangleAlert" bodyClass="p-2">
            {agg.top.map((s, i) => (
              <button
                key={s.name}
                className="w-full flex items-center gap-2.5 rounded px-2 py-2 text-left hover:bg-raised/50 transition-colors"
              >
                <span className="font-mono text-[11px] text-faint w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-ink truncate">{s.label}</div>
                  <div className="text-[10px] font-mono text-faint">{HAZARDS[topHazard(s)].label} pressure</div>
                </div>
                <span className="font-mono text-[13px]" style={{ color: scoreColor(s.overall) }}>{s.overall}</span>
                <RiskBadge score={s.overall} />
              </button>
            ))}
          </Panel>

          <Panel title="Flood Watch" icon="Waves" bodyClass="p-2.5 space-y-2">
            {floodWatch.map((s) => (
              <MeterRow key={s.name} label={s.label} value={s.scores.flood} color="#2C8CFF" />
            ))}
          </Panel>

          <Panel title="Fire Watch" icon="Flame" bodyClass="p-2.5 space-y-2">
            {fireWatch.map((s) => (
              <MeterRow key={s.name} label={s.label} value={s.scores.fire} color="#F97316" />
            ))}
          </Panel>

          <Panel title="Live Alert Feed" icon="Radio" bodyClass="p-2">
            <div className="space-y-1 max-h-[220px] overflow-y-auto">
              {alerts.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-raised/50">
                  <SeverityTag severity={a.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] text-ink truncate">{a.title}</div>
                    <div className="text-[10px] font-mono text-faint">{fmtTime(a.time)} • {a.state}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function topHazard(s) {
  let best = 'flood'
  let bv = -1
  for (const k of HAZARD_KEYS) {
    if (s.scores[k] > bv) { bv = s.scores[k]; best = k }
  }
  return best
}