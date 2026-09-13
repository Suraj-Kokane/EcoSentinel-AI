import { useMemo, useState } from 'react'
import { RiskMap } from '../components/map/RiskMap.jsx'
import { Panel, Tag } from '../components/ui/Primitives.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { KpiCard } from '../components/ui/KpiCard.jsx'
import { DataTable, col } from '../components/ui/Table.jsx'
import { INFRASTRUCTURE, INFRA_CATEGORIES, INFRA_AT_RISK } from '../data/infrastructure.js'
import { scoreColor } from '../lib/risk.js'

export default function Infrastructure() {
  const [cat, setCat] = useState('all')
  const [riskOnly, setRiskOnly] = useState(false)

  const counts = useMemo(() => {
    const m = {}
    INFRA_CATEGORIES.forEach((c) => (m[c.key] = INFRASTRUCTURE.filter((a) => a.category === c.key).length))
    return m
  }, [])

  const filtered = useMemo(() => {
    let list = INFRASTRUCTURE
    if (cat !== 'all') list = list.filter((a) => a.category === cat)
    if (riskOnly) list = list.filter((a) => a.risk >= 55)
    return [...list].sort((a, b) => b.risk - a.risk)
  }, [cat, riskOnly])

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease]">
      {/* category strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
        {INFRA_CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(cat === c.key ? 'all' : c.key)}
            className={`es-panel p-2.5 text-left transition-colors hover:bg-raised ${cat === c.key ? 'ring-1 ring-electric' : ''}`}
          >
            <div className="flex items-center gap-2">
              <Icon name={c.icon} size={15} className="text-electric" />
              <span className="es-title flex-1">{c.label}</span>
            </div>
            <div className="font-display font-bold text-2xl mt-1.5">{counts[c.key] || 0}</div>
            <div className="text-[10px] font-mono text-critical">{INFRASTRUCTURE.filter((a) => a.category === c.key && a.risk >= 55).length} at risk</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-3">
        <div className="space-y-3">
          <RiskMap className="h-[420px]" showRail={false} initialOverlays={{ reports: false, seismic: false, infra: true, fire: false }} />

          <Panel
            title={cat === 'all' ? 'All Assets' : INFRA_CATEGORIES.find((c) => c.key === cat)?.label}
            icon="Building2"
            actions={
              <button onClick={() => setRiskOnly((r) => !r)} className={`text-[11px] font-mono ${riskOnly ? 'text-critical' : 'text-faint'}`}>
                {riskOnly ? '★ RISK ONLY' : 'ALL'}
              </button>
            }
            bodyClass="p-2"
          >
            <DataTable
              rowKey="id"
              columns={[
                col('name', 'Asset', { render: (r) => <span className="text-ink font-medium">{r.name}</span> }),
                col('category', 'Type', { render: (r) => <span className="text-sub">{INFRA_CATEGORIES.find((c) => c.key === r.category)?.label}</span> }),
                col('state', 'State', { render: (r) => <span className="font-mono text-[11px] text-faint">{r.state}</span> }),
                col('detail', 'Detail', { render: (r) => <span className="text-[11px] text-faint hidden lg:inline">{r.detail}</span> }),
                col('risk', 'Exposure', { render: (r) => <span className="font-mono" style={{ color: scoreColor(r.risk) }}>{r.risk}</span> }),
                col('tier', 'Tier', { render: (r) => <Tag color={scoreColor(r.risk)}>{r.tier.toUpperCase()}</Tag> }),
              ]}
              data={filtered}
            />
          </Panel>
        </div>

        <div className="space-y-3">
          <KpiCard label="Total Assets" value={INFRASTRUCTURE.length} accent="#2C8CFF" icon="Building2" />
          <KpiCard label="At Risk" value={INFRA_AT_RISK.length} accent="#EF4444" icon="TriangleAlert" sub="Exposure ≥ 55/100" />
          <KpiCard label="Critical" value={INFRASTRUCTURE.filter((a) => a.risk >= 75).length} accent="#F97316" icon="ShieldAlert" />

          <Panel title="Most Exposed Assets" icon="Activity" bodyClass="p-2">
            {INFRA_AT_RISK.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-center gap-2.5 rounded px-2 py-2 hover:bg-raised/50">
                <Icon name={INFRA_CATEGORIES.find((c) => c.key === a.category)?.icon} size={13} className="text-faint shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-ink truncate">{a.name}</div>
                  <div className="text-[10px] font-mono text-faint">{a.district}, {a.state}</div>
                </div>
                <span className="font-mono text-[12px]" style={{ color: scoreColor(a.risk) }}>{a.risk}</span>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  )
}