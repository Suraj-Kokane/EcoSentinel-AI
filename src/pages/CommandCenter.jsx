import { useMemo, useState } from 'react'
import { RiskMap } from '../components/map/RiskMap.jsx'
import { Panel, ProgressBar, Divider, StatusDot, Tag } from '../components/ui/Primitives.jsx'
import { SeverityTag } from '../components/ui/Badge.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { RiskGauge, Sparkline } from '../components/ui/Gauge.jsx'
import { STATES, nationalAggregate, STATE_MAP } from '../data/states.js'
import { buildDistrictData } from '../data/districts.js'
import { recommendForRegion } from '../lib/deployment.js'
import { scoreColor } from '../lib/risk.js'
import { TEAMS, RESOURCES, TEAM_TYPES } from '../data/teams.js'
import { useGeoData } from '../store/GeoDataContext.jsx'
import { useLive } from '../store/LiveDataContext.jsx'
import { fmtTime } from '../lib/format.js'
import { INFRA_AT_RISK } from '../data/infrastructure.js'

export default function CommandCenter() {
  const { alerts } = useLive()
  const geo = useGeoData()
  const agg = nationalAggregate()
  const [selectedState, setSelectedState] = useState(null)

  const topStates = agg.top

  const criticalDistricts = useMemo(() => {
    if (!geo.districtsByState) return []
    const list = []
    for (const s of topStates.slice(0, 4)) {
      const names = geo.districtsByState[s.name] || []
      const ranked = names.map((dn) => buildDistrictData(STATE_MAP[s.name], dn)).sort((a, b) => b.overall - a.overall)
      if (ranked[0]) list.push(ranked[0])
    }
    return list.sort((a, b) => b.overall - a.overall)
  }, [geo.districtsByState, topStates])

  const deployment = useMemo(
    () => topStates.slice(0, 4).map((s) => ({ state: s, rec: recommendForRegion(s.label, s.scores, s.population) })),
    [topStates],
  )

  const reliefCamps = useMemo(() => {
    if (!geo.districtsByState) return []
    const out = []
    for (const s of topStates.slice(0, 3)) {
      const names = geo.districtsByState[s.name] || []
      const ranked = names.map((dn) => buildDistrictData(STATE_MAP[s.name], dn)).sort((a, b) => a.overall - b.overall)
      if (ranked.length) out.push({ state: s.label, district: ranked[ranked.length - 1], score: ranked[ranked.length - 1].overall })
    }
    return out
  }, [geo.districtsByState, topStates])

  const activeAlerts = alerts.filter((a) => a.status === 'active').length
  const deployedTeams = TEAMS.filter((t) => t.status === 'deployed').length

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease]">
      {/* national situation strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: 'ACTIVE ALERTS', v: activeAlerts, c: '#EF4444', i: 'Bell' },
          { l: 'CRITICAL DISTRICTS', v: criticalDistricts.filter((d) => d.overall >= 75).length, c: '#F97316', i: 'TriangleAlert' },
          { l: 'INFRA AT RISK', v: INFRA_AT_RISK.length, c: '#EAB308', i: 'Building2' },
          { l: 'TEAMS DEPLOYED', v: deployedTeams, c: '#22D3EE', i: 'Truck' },
          { l: 'NDRF BATTALIONS', v: RESOURCES.ndrfTeams.allocated, c: '#22C55E', i: 'ShieldAlert' },
        ].map((s) => (
          <div key={s.l} className="es-panel p-3 flex items-center gap-3">
            <div className="grid place-items-center h-9 w-9 rounded-md" style={{ background: `${s.c}16`, color: s.c }}>
              <Icon name={s.i} size={18} />
            </div>
            <div>
              <div className="font-display font-bold text-2xl leading-none" style={{ color: s.c }}>{s.v}</div>
              <div className="es-kicker text-faint mt-0.5">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* live incident feed */}
        <Panel title="Live Incident Feed" icon="Radio" actions={<Tag color="#EF4444">LIVE</Tag>} bodyClass="p-2">
          <div className="space-y-1 max-h-[520px] overflow-y-auto">
            {alerts.slice(0, 16).map((a, i) => (
              <div key={a.id} className={`rounded px-2.5 py-2 border-l-2 hover:bg-raised/50 ${i === 0 ? 'bg-raised/40' : ''}`} style={{ borderLeftColor: a.severity === 4 ? '#EF4444' : a.severity === 3 ? '#F97316' : '#EAB308' }}>
                <div className="flex items-center gap-2">
                  <SeverityTag severity={a.severity} />
                  <span className="text-[10px] font-mono text-faint ml-auto">{fmtTime(a.time)}</span>
                </div>
                <div className="text-[13px] text-ink mt-1 leading-snug">{a.title}</div>
                <div className="text-[11px] font-mono text-faint mt-1">{a.state} • {a.district}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* critical zones + infra + deployment suggestions */}
        <div className="space-y-3">
          <Panel title="Critical Districts" icon="TriangleAlert" bodyClass="p-2">
            {criticalDistricts.map((d) => (
              <button key={d.name} onClick={() => setSelectedState(d.state)} className="w-full flex items-center gap-2.5 rounded px-2 py-2 hover:bg-raised/50 text-left">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-ink">{d.name}</div>
                  <div className="text-[10px] font-mono text-faint">{d.state}</div>
                </div>
                <span className="font-mono text-[13px]" style={{ color: scoreColor(d.overall) }}>{d.overall}</span>
              </button>
            ))}
          </Panel>

          <Panel title="Infrastructure At Risk" icon="Building2" bodyClass="p-2">
            {INFRA_AT_RISK.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-2.5 rounded px-2 py-2 hover:bg-raised/50">
                <Icon name="Zap" size={13} className="text-faint shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-ink truncate">{a.name}</div>
                  <div className="text-[10px] font-mono text-faint">{a.state}</div>
                </div>
                <span className="text-[10px] font-mono" style={{ color: scoreColor(a.risk) }}>{a.risk}</span>
              </div>
            ))}
          </Panel>

          <Panel title="NDRF Deployment Suggestions" icon="ShieldAlert" bodyClass="p-2.5 space-y-2">
            {deployment.map(({ state, rec }) => (
              <div key={state.name} className="rounded border border-hairline bg-panel p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-ink font-medium">{state.label}</span>
                  <Tag color={rec.resources.ndrf > 0 || rec.tier.startsWith('P0') || rec.tier.startsWith('P1') ? '#F97316' : '#22C55E'}>{rec.tier}</Tag>
                </div>
                <div className="mt-1.5 grid grid-cols-5 gap-1.5 text-center">
                  {[
                    { l: 'NDRF', v: rec.resources.ndrf, c: '#F97316' },
                    { l: 'Fire', v: rec.resources.brigade, c: '#EF4444' },
                    { l: 'Amb', v: rec.resources.ambulance, c: '#22D3EE' },
                    { l: 'Camp', v: rec.resources.camp, c: '#22C55E' },
                    { l: 'Med', v: rec.resources.medical, c: '#A78BFA' },
                  ].map((r) => (
                    <div key={r.l} className="rounded bg-raised/40 py-1">
                      <div className="font-display font-bold text-[15px]" style={{ color: r.c }}>{r.v}</div>
                      <div className="text-[8px] font-mono text-faint">{r.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Panel>
        </div>

        {/* teams + resources + situation */}
        <div className="space-y-3">
          <Panel title="Response Teams" icon="Truck" bodyClass="p-2">
            <div className="space-y-1">
              {TEAMS.map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 rounded px-2 py-2 hover:bg-raised/50">
                  <span className="h-2 w-2 rounded-full" style={{ background: TEAM_TYPES[t.type].color, boxShadow: `0 0 6px ${TEAM_TYPES[t.type].color}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-ink truncate">{t.name}</div>
                    <div className="text-[10px] font-mono text-faint">{t.location} • {t.size} personnel</div>
                  </div>
                  <StatusTea status={t.status} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Emergency Resource Allocation" icon="Gauge" bodyClass="p-3 space-y-2.5">
            {Object.entries(RESOURCES).map(([k, r]) => (
              <div key={k}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-sub capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-mono text-faint">{r.allocated}/{r.total}</span>
                </div>
                <ProgressBar value={(r.allocated / r.total) * 100} color={r.available <= 20 ? '#EF4444' : '#2C8CFF'} height={6} />
              </div>
            ))}
          </Panel>

          <Panel title="Relief Camp Suggestions" icon="Users" bodyClass="p-2">
            {reliefCamps.map((rc) => (
              <div key={rc.district.name} className="flex items-center gap-2.5 rounded px-2 py-2 hover:bg-raised/50">
                <Icon name="CheckCircle2" size={13} className="text-safe shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-ink truncate">{rc.district.name}</div>
                  <div className="text-[10px] font-mono text-faint">{rc.state} • low-risk zone</div>
                </div>
                <span className="font-mono text-[11px] text-safe">{rc.score}</span>
              </div>
            ))}
          </Panel>
        </div>
      </div>

      {/* situation map */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3">
        <RiskMap className="h-[420px]" showRail={false} />
        <Panel title="National Situation Overview" icon="Radar" bodyClass="p-3 space-y-3">
          <div className="text-center">
            <RiskGauge score={Math.round(STATES.reduce((a, s) => a + s.overall, 0) / STATES.length)} label="NATIONAL RISK" size={140} />
          </div>
          <Divider />
          {topStates.slice(0, 5).map((s, i) => (
            <div key={s.name} className="flex items-center gap-2.5">
              <span className="font-mono text-[11px] text-faint w-4">{i + 1}</span>
              <span className="flex-1 text-[12px] text-ink truncate">{s.label}</span>
              <Sparkline data={s.spark} color={scoreColor(s.overall)} width={70} height={20} />
              <span className="font-mono text-[12px]" style={{ color: scoreColor(s.overall) }}>{s.overall}</span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  )
}

function StatusTea({ status }) {
  const m = { deployed: ['DEPLOYED', '#22C55E'], enroute: ['EN ROUTE', '#EAB308'], standby: ['STANDBY', '#54719B'] }[status]
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[9px]" style={{ color: m[1] }}>
      <StatusDot color={m[1]} pulse={status === 'deployed'} size={6} />
      {m[0]}
    </span>
  )
}