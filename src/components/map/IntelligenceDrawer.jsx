import { useMemo } from 'react'
import { Icon } from '../ui/Icon.jsx'
import { RiskGauge, Sparkline } from '../ui/Gauge.jsx'
import { MeterRow, Panel, Divider, Tag } from '../ui/Primitives.jsx'
import { RiskBadge, SeverityTag } from '../ui/Badge.jsx'
import { HAZARDS, HAZARD_KEYS } from '../../lib/risk.js'
import { stateByName } from '../../data/states.js'
import { buildDistrictData } from '../../data/districts.js'
import { recommendForRegion } from '../../lib/deployment.js'
import { ehiScore, ehiGrade, ehiBreakdown } from '../../lib/ehi.js'
import { useLive } from '../../store/LiveDataContext.jsx'
import { fmtTime } from '../../lib/format.js'
import { INCIDENT_TYPES } from '../../data/incidents.js'

export function IntelligenceDrawer({ scope, onClose, onDrill }) {
  const { alerts, incidents } = useLive()

  const info = useMemo(() => {
    if (!scope) return null
    if (scope.kind === 'district') {
      const st = stateByName(scope.state)
      if (!st) return null
      const dd = buildDistrictData(st, scope.name)
      return {
        kind: 'District',
        name: dd.name,
        parent: st.label,
        stateKey: st.name,
        overall: dd.overall,
        scores: dd.scores,
        ehi: dd.ehi,
        alerts: dd.alerts,
        population: dd.population,
        extra: dd,
      }
    }
    const st = stateByName(scope.name)
    if (!st) return null
    return {
      kind: st.type === 'State' ? 'State' : 'Union Territory',
      name: st.label,
      stateKey: st.name,
      overall: st.overall,
      scores: st.scores,
      ehi: st.ehi,
      alerts: st.alerts,
      population: st.population,
      spark: st.spark,
    }
  }, [scope])

  const recs = useMemo(() => {
    if (!info) return null
    return recommendForRegion(info.name, info.scores, info.population)
  }, [info])

  if (!info) return null

  const regionAlerts = alerts.filter((a) => a.state === info.stateKey).slice(0, 4)
  const regionReports = incidents.filter((i) => i.state === info.stateKey).length
  const grade = ehiGrade(info.ehi)

  // top hazards for breakdown
  const topHazards = HAZARD_KEYS.map((k) => ({ key: k, value: info.scores[k] ?? 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const cols = {
    flood: '#2C8CFF', cyclone: '#22D3EE', heatwave: '#F97316', coldWave: '#67E8F9',
    earthquake: '#EAB308', landslide: '#F59E0B', fire: '#F97316', airPollution: '#A855F7',
    waterPollution: '#38BDF8', drought: '#FBBF24', infrastructure: '#94A3B8',
  }

  return (
    <div className="absolute inset-y-0 right-0 z-[500] w-[340px] max-w-[92%] bg-deep/95 backdrop-blur border-l border-hairline shadow-2xl overflow-y-auto animate-[fadeUp_.25s_ease]">
      <div className="flex items-start justify-between p-3 border-b border-hairline">
        <div>
          <div className="es-kicker text-faint">{info.kind.toUpperCase()}</div>
          <h2 className="font-display font-bold text-xl leading-tight">{info.name}</h2>
          {info.parent && <div className="text-[11px] text-sub font-mono">⟨ {info.parent} ⟩</div>}
        </div>
        <button onClick={onClose} className="text-sub hover:text-ink p-1" aria-label="close">
          <Icon name="X" size={18} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* header gauges */}
        <div className="flex items-center justify-around gap-2 py-1">
          <div className="text-center">
            <RiskGauge score={info.overall} label="RISK" size={110} />
            <RiskBadge score={info.overall} className="mt-1" />
          </div>
          <div className="text-center">
            <RiskGauge score={info.ehi} label="EHI" size={110} valueColor={grade.color} />
            <Tag color={grade.color}>{grade.label}</Tag>
          </div>
        </div>

        {info.spark && (
          <div className="flex items-center justify-between rounded-md border border-hairline bg-panel px-3 py-2">
            <span className="es-kicker">12-MO RISK TREND</span>
            <Sparkline data={info.spark} color="#F97316" height={26} width={120} />
          </div>
        )}

        {/* threat breakdown */}
        <Panel title="Threat Breakdown" icon="Activity" dense bodyClass="p-3 space-y-2.5">
          {topHazards.map((h) => (
            <MeterRow key={h.key} label={HAZARDS[h.key].label} value={h.value} color={cols[h.key] || '#2C8CFF'} icon={HAZARDS[h.key].icon} />
          ))}
        </Panel>

        {/* stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: 'Active Alerts', v: regionAlerts.length || info.alerts, c: '#EF4444' },
            { l: 'Citizen Reports', v: regionReports, c: '#22D3EE' },
            { l: 'EHI', v: `${info.ehi}/100`, c: grade.color },
          ].map((s) => (
            <div key={s.l} className="rounded-md border border-hairline bg-panel px-2 py-2 text-center">
              <div className="font-display font-bold text-lg" style={{ color: s.c }}>{s.v}</div>
              <div className="es-kicker text-faint">{s.l.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* district drill-down for states */}
        {info.kind !== 'District' && onDrill && (
          <button
            onClick={() => onDrill(info.stateKey)}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-hairline bg-raised/40 py-2 text-[12px] text-sub hover:text-ink hover:border-edge transition-colors"
          >
            <Icon name="Layers" size={14} /> District-level intelligence
          </button>
        )}

        {/* AI recommendation + deployment */}
        {recs && (
          <Panel title="AI Recommendation" icon="Sparkles" dense bodyClass="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Tag color={recs.resources.ndrf > 0 || recs.tier.startsWith('P0') || recs.tier.startsWith('P1') ? '#F97316' : '#22C55E'}>{recs.tier}</Tag>
              <span className="text-[11px] font-mono text-sub">PRIORITY {info.overall >= 75 ? 'CRITICAL' : info.overall >= 55 ? 'HIGH' : 'ELEVATED'}</span>
            </div>
            <p className="text-[12px] leading-relaxed text-sub">{recs.rationale}</p>

            <Divider />
            <div className="text-[10px] font-mono tracking-wider text-faint uppercase">AI Resource Deployment</div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {[
                { l: 'NDRF', v: recs.resources.ndrf, c: '#F97316' },
                { l: 'Fire', v: recs.resources.brigade, c: '#EF4444' },
                { l: 'Amb.', v: recs.resources.ambulance, c: '#22D3EE' },
                { l: 'Camps', v: recs.resources.camp, c: '#22C55E' },
                { l: 'Med.', v: recs.resources.medical, c: '#A78BFA' },
              ].map((r) => (
                <div key={r.l} className="rounded border border-hairline bg-panel py-1.5">
                  <div className="font-display font-bold" style={{ color: r.c }}>{r.v}</div>
                  <div className="text-[8px] font-mono text-faint">{r.l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* recent alerts */}
        <Panel title="Recent Alerts" icon="Bell" dense bodyClass="p-2">
          {regionAlerts.length === 0 ? (
            <div className="py-3 text-center es-kicker text-faint">No active alerts</div>
          ) : (
            <div className="space-y-1">
              {regionAlerts.map((a) => (
                <div key={a.id} className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-raised/50">
                  <SeverityTag severity={a.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] text-ink truncate">{a.title}</div>
                    <div className="text-[10px] font-mono text-faint">{fmtTime(a.time)} • {a.district}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {info.extra && (
          <Panel title="District Telemetry" icon="Gauge" dense bodyClass="p-3 space-y-2.5">
            <MeterRow label="Rainfall Anomaly" value={`${info.extra.rainfallAnomaly}%`} color={info.extra.rainfallAnomaly < 0 ? '#EF4444' : '#22C55E'} icon="CloudRain" />
            <MeterRow label="Reservoir Level" value={`${info.extra.reservoir}%`} color={info.extra.reservoir < 35 ? '#EF4444' : '#22C55E'} icon="Waves" />
            <MeterRow label="Soil Moisture Index" value={`${info.extra.soilMoisture}%`} color={info.extra.soilMoisture < 35 ? '#EF4444' : '#EAB308'} icon="Droplets" />
            <MeterRow label="Water Stress Index" value={`${info.extra.waterStress}%`} color={info.extra.waterStress > 60 ? '#EF4444' : '#22C55E'} icon="Activity" />
          </Panel>
        )}
      </div>
    </div>
  )
}

export function incidentTypeLabel(key) {
  return INCIDENT_TYPES.find((t) => t.key === key)?.label || key
}