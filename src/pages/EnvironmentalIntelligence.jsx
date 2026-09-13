import { useMemo } from 'react'
import { Panel, MeterRow, Divider, Stat } from '../components/ui/Primitives.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { RiskGauge } from '../components/ui/Gauge.jsx'
import { AreaChartCard, BarChartCard } from '../components/ui/Chart.jsx'
import { STATES } from '../data/states.js'
import { POLLUTION_TREND } from '../data/analytics.js'
import { scoreColor } from '../lib/risk.js'

export default function EnvironmentalIntelligence() {
  const nationalAQI = useMemo(() => Math.round(STATES.reduce((a, s) => a + s.scores.airPollution, 0) / STATES.length), [])
  const nationalWater = useMemo(() => Math.round(100 - STATES.reduce((a, s) => a + s.scores.waterPollution, 0) / STATES.length), [])

  const airStates = useMemo(() => [...STATES].sort((a, b) => b.scores.airPollution - a.scores.airPollution).slice(0, 8), [])
  const waterStates = useMemo(() => [...STATES].sort((a, b) => b.scores.waterPollution - a.scores.waterPollution).slice(0, 8), [])

  const barData = airStates.map((s) => ({ name: s.label, value: s.scores.airPollution, color: scoreColor(s.scores.airPollution) }))

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <EnvGauge label="NATIONAL AQI" value={nationalAQI} inv />
        <EnvGauge label="WATER QUALITY" value={nationalWater} />
        <StatCard label="PM2.5 AVG" value={POLLUTION_TREND[POLLUTION_TREND.length - 1].pm25} unit="µg/m³" color="#A855F7" />
        <StatCard label="CRITICAL AIR" value={STATES.filter((s) => s.scores.airPollution >= 75).length} unit="states" color="#22D3EE" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Panel title="Air Quality Trend" icon="CloudFog" bodyClass="p-3">
          <AreaChartCard data={POLLUTION_TREND} keys={['aqi']} colors={{ aqi: '#A855F7' }} height={200} xKey="month" />
          <div className="mt-2 flex justify-between text-[10px] font-mono text-faint">
            <span>AQI (index)</span>
            <span>trailing 12 months</span>
          </div>
        </Panel>

        <Panel title="AQI Leaderboard" icon="BarChart3" bodyClass="p-3 space-y-2">
          {barData.map((d) => (
            <MeterRow key={d.name} label={d.name} value={d.value} color={scoreColor(d.value)} />
          ))}
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Panel title="Water Pollution Index" icon="Droplets" bodyClass="p-2.5 space-y-2">
          {waterStates.map((s) => (
            <MeterRow key={s.name} label={s.label} value={s.scores.waterPollution} color={scoreColor(s.scores.waterPollution)} />
          ))}
        </Panel>

        <Panel title="Environmental Insights" icon="Sparkles" bodyClass="p-3 space-y-2">
          <Insight c="#A855F7" text="Indo-Gangetic corridor shows the highest PM2.5 burden, driven by stubble burning, vehicular load and inversion seasonality." />
          <Insight c="#22D3EE" text="Water-stress and effluent load are co-located with industrial corridors in western and eastern belts." />
          <Insight c="#F97316" text="Heat-island effect in metro regions is amplifying night-time minimums, extending heat exposure windows." />
          <Insight c="#22C55E" text="Peninsular and coastal air quality remains broadly stable relative to the national mean." />
        </Panel>
      </div>
    </div>
  )
}

function EnvGauge({ label, value, inv = false }) {
  return (
    <Panel bodyClass="flex items-center gap-3 p-3">
      <RiskGauge score={inv ? 100 - value : value} valueColor={inv ? scoreColor(value) : scoreColor(100 - value)} size={84} label="" />
      <div>
        <div className="font-display font-bold text-2xl" style={{ color: inv ? scoreColor(value) : scoreColor(100 - value) }}>{value}</div>
        <div className="es-kicker text-faint mt-0.5">{label}</div>
      </div>
    </Panel>
  )
}

function StatCard({ label, value, unit, color }) {
  return (
    <Panel bodyClass="p-3">
      <div className="font-display font-bold text-3xl" style={{ color }}>{value}</div>
      <div className="es-kicker text-faint mt-0.5">{label}</div>
      <div className="text-[10px] font-mono text-faint mt-1">{unit}</div>
    </Panel>
  )
}

function Insight({ c, text }) {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-hairline bg-panel p-2.5">
      <span className="h-2 w-2 rounded-full mt-1 shrink-0" style={{ background: c }} />
      <p className="text-[12px] text-sub leading-relaxed">{text}</p>
    </div>
  )
}