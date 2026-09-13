import { useMemo } from 'react'
import { Panel, Stat } from '../components/ui/Primitives.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { ChartCard, AreaChartCard, LineChartCard, BarChartCard, RadialGaugeChart } from '../components/ui/Chart.jsx'
import { STATES } from '../data/states.js'
import { DISASTER_TREND, ACCURACY_TREND, POLLUTION_TREND, MONTHLY_REPORTS } from '../data/analytics.js'
import { scoreColor } from '../lib/risk.js'
import { nationalEHI, ehiGrade } from '../lib/ehi.js'
import { fmtDate } from '../lib/format.js'

export default function Analytics() {
  const ranking = useMemo(() => [...STATES].sort((a, b) => b.overall - a.overall).map((s) => ({ name: s.label, value: s.overall, color: scoreColor(s.overall) })), [])

  const acc = useMemo(() => {
    const last = ACCURACY_TREND[ACCURACY_TREND.length - 1]
    return Math.round((last.flood + last.fire + last.cyclone + last.drought) / 4)
  }, [])

  const ehi = nationalEHI(STATES)
  const grade = ehiGrade(ehi)

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Panel bodyClass="p-3">
          <Stat label="Prediction Mean Accuracy" value={acc} unit="%" color="#22C55E" />
          <div className="text-[10px] font-mono text-faint mt-1">4-hazard trailing mean</div>
        </Panel>
        <Panel bodyClass="p-3">
          <Stat label="National EHI" value={ehi} unit="/100" color={grade.color} />
          <div className="text-[10px] font-mono text-faint mt-1">{grade.label}</div>
        </Panel>
        <Panel bodyClass="p-3">
          <Stat label="Events (12 mo)" value={DISASTER_TREND.reduce((a, d) => a + d.flood + d.fire + d.cyclone + d.heatwave + d.earthquake + d.drought + d.landslide, 0)} color="#F97316" />
          <div className="text-[10px] font-mono text-faint mt-1">multi-hazard incidents</div>
        </Panel>
        <Panel bodyClass="p-3">
          <Stat label="Monitored Regions" value={STATES.length} color="#2C8CFF" />
          <div className="text-[10px] font-mono text-faint mt-1">states &amp; union territories</div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <ChartCard title="State Risk Ranking" icon="BarChart3" height={460} bodyClass="p-2">
          <BarChartCard data={ranking.slice(0, 16)} dataKey="value" height={440} />
        </ChartCard>

        <div className="space-y-3">
          <ChartCard title="Disaster Trend (12 months)" icon="TrendingUp" height={220} bodyClass="p-2">
            <LineChartCard
              data={DISASTER_TREND}
              keys={['flood', 'fire', 'cyclone', 'heatwave']}
              colors={{ flood: '#2C8CFF', fire: '#F97316', cyclone: '#22D3EE', heatwave: '#EF4444' }}
              height={200}
            />
          </ChartCard>

          <ChartCard title="Prediction Accuracy" icon="CheckCircle2" height={220} bodyClass="p-2">
            <div className="grid grid-cols-[1fr_130px] h-full items-center">
              <div className="h-[200px]">
                <LineChartCard data={ACCURACY_TREND} keys={['flood', 'fire', 'cyclone', 'drought']} colors={{ flood: '#2C8CFF', fire: '#F97316', cyclone: '#22D3EE', drought: '#FBBF24' }} height={200} />
              </div>
              <RadialGaugeChart value={acc} color="#22C55E" label="MEAN %" height={160} />
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <ChartCard title="Pollution Analysis" icon="CloudFog" height={220} bodyClass="p-2">
          <AreaChartCard data={POLLUTION_TREND} keys={['aqi']} colors={{ aqi: '#A855F7' }} height={200} />
        </ChartCard>

        <ChartCard title="Heat & Drought Trend" icon="ThermometerSun" height={220} bodyClass="p-2">
          <LineChartCard data={DISASTER_TREND} keys={['heatwave', 'drought']} colors={{ heatwave: '#EF4444', drought: '#FBBF24' }} height={200} />
        </ChartCard>

        <Panel title="Monthly Reports" icon="Download" bodyClass="p-2.5 space-y-1.5">
          {MONTHLY_REPORTS.map((r) => (
            <button key={r.title} className="w-full flex items-center gap-2.5 rounded border border-hairline bg-panel px-2.5 py-2 text-left hover:bg-raised/50 transition-colors">
              <Icon name="Download" size={14} className="text-electric shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-ink truncate">{r.title}</div>
                <div className="text-[10px] font-mono text-faint">{r.date} • {r.size}</div>
              </div>
              <span className={`font-mono text-[9px] uppercase ${r.status === 'published' ? 'text-safe' : r.status === 'draft' ? 'text-faint' : 'text-electric'}`}>{r.status}</span>
            </button>
          ))}
        </Panel>
      </div>
    </div>
  )
}