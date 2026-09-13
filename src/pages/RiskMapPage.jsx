import { RiskMap } from '../components/map/RiskMap.jsx'
import { Panel, Divider } from '../components/ui/Primitives.jsx'
import { KpiCard } from '../components/ui/KpiCard.jsx'
import { nationalAggregate, STATES } from '../data/states.js'
import { scoreColor } from '../lib/risk.js'

export default function RiskMapPage() {
  const agg = nationalAggregate()
  const flood = STATES.filter((s) => s.scores.flood >= 55).length
  const fire = STATES.filter((s) => s.scores.fire >= 55).length
  const drought = STATES.filter((s) => s.scores.drought >= 55).length

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Active Alerts" value={agg.totalAlerts} accent="#EF4444" icon="Bell" />
        <KpiCard label="Critical States" value={agg.critical} accent="#F97316" icon="TriangleAlert" />
        <KpiCard label="Flood Watch" value={flood} accent="#2C8CFF" icon="Waves" />
        <KpiCard label="Drought Watch" value={drought} accent="#FBBF24" icon="SunDim" />
      </div>

      <RiskMap className="h-[calc(100vh-210px)] min-h-[460px]" initialLayer="overall" />
    </div>
  )
}