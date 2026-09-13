import { useMemo, useState } from 'react'
import { Panel, Tag, Divider } from '../components/ui/Primitives.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { SeverityTag } from '../components/ui/Badge.jsx'
import { DataTable, col } from '../components/ui/Table.jsx'
import { HAZARDS, HAZARD_KEYS } from '../lib/risk.js'
import { useLive } from '../store/LiveDataContext.jsx'
import { fmtTime } from '../lib/format.js'

export default function AlertCenter() {
  const { alerts } = useLive()
  const [sev, setSev] = useState('all')
  const [hazard, setHazard] = useState('all')
  const [q, setQ] = useState('')
  const [acked, setAcked] = useState(() => new Set())
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (sev !== 'all' && a.severity !== Number(sev)) return false
      if (hazard !== 'all' && a.hazard !== hazard) return false
      if (q && !`${a.title} ${a.state} ${a.district}`.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [alerts, sev, hazard, q])

  const counts = useMemo(() => {
    const c = { all: alerts.length, 1: 0, 2: 0, 3: 0, 4: 0 }
    alerts.forEach((a) => (c[a.severity] = (c[a.severity] || 0) + 1))
    return c
  }, [alerts])

  const ack = (id) => setAcked((s) => new Set(s).add(id))

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease]">
      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setSev('all')} className={`rounded-md border px-3 py-1.5 text-[12px] ${sev === 'all' ? 'text-ink border-edge bg-raised' : 'text-sub border-hairline'}`}>All ({counts.all})</button>
        {[4, 3, 2, 1].map((s) => (
          <button key={s} onClick={() => setSev(String(s))} className={`rounded-md border px-3 py-1.5 text-[12px] ${sev === String(s) ? 'text-ink' : 'text-sub border-hairline'}`} style={sev === String(s) ? { borderColor: ['', '#22C55E', '#EAB308', '#F97316', '#EF4444'][s], background: `${['', '#22C55E', '#EAB308', '#F97316', '#EF4444'][s]}16` } : {}}>
            {['', 'Low', 'Moderate', 'High', 'Critical'][s]} ({counts[s]})
          </button>
        ))}
        <div className="flex items-center gap-1.5 ml-auto rounded-md border border-hairline bg-panel px-2.5 py-1.5">
          <Icon name="Search" size={14} className="text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search alerts…" className="bg-transparent text-[12px] text-ink placeholder:text-faint outline-none w-[180px]" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setHazard('all')} className={`rounded px-2 py-1 text-[11px] font-mono ${hazard === 'all' ? 'text-ink bg-electric/20' : 'text-sub hover:text-ink'}`}>ALL HAZARDS</button>
        {HAZARD_KEYS.map((k) => (
          <button key={k} onClick={() => setHazard(k)} className={`rounded px-2 py-1 text-[11px] font-mono ${hazard === k ? 'text-ink' : 'text-sub hover:text-ink'}`} style={hazard === k ? { background: '#2C8CFF22' } : {}}>
            {HAZARDS[k].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-3">
        <Panel title={`Alert Feed (${filtered.length})`} icon="Bell" bodyClass="p-2">
          <DataTable
            rowKey="id"
            onRowClick={(r) => setSelected(r)}
            columns={[
              col('sev', 'Sev', { render: (r) => <SeverityTag severity={r.severity} /> }),
              col('hazard', 'Hazard', { render: (r) => <span className="text-sub text-[12px]">{HAZARDS[r.hazard]?.label || r.hazard}</span> }),
              col('title', 'Alert', { render: (r) => <span className="text-ink">{r.title}</span> }),
              col('state', 'Region', { render: (r) => <span className="font-mono text-[11px] text-faint">{r.state}</span> }),
              col('source', 'Source', { render: (r) => <span className="font-mono text-[10px] text-faint">{r.source}</span> }),
              col('time', 'Time', { render: (r) => <span className="font-mono text-[10px] text-faint">{fmtTime(r.time)}</span> }),
              col('status', 'Status', { render: (r) => acked.has(r.id) ? <Tag color="#22C55E">ACK</Tag> : <Tag color="#F97316">ACTIVE</Tag> }),
            ]}
            data={filtered}
          />
        </Panel>

        {/* detail */}
        <div className="space-y-3">
          {selected ? (
            <Panel title="Alert Detail" icon="CircleAlert" bodyClass="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <SeverityTag severity={selected.severity} />
                <span className="text-[10px] font-mono text-faint">{selected.id}</span>
              </div>
              <h2 className="font-display font-bold text-lg leading-tight text-ink">{selected.title}</h2>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <DetailRow l="Hazard" v={HAZARDS[selected.hazard]?.label} />
                <DetailRow l="State" v={selected.state} />
                <DetailRow l="District" v={selected.district} />
                <DetailRow l="Source" v={selected.source} />
                <DetailRow l="Raised" v={fmtTime(selected.time)} />
                <DetailRow l="Lat/Lng" v={`${selected.lat.toFixed(2)}, ${selected.lng.toFixed(2)}`} />
              </div>
              <Divider />
              <div className="flex gap-2">
                <button onClick={() => ack(selected.id)} disabled={acked.has(selected.id)} className="flex-1 rounded-md border border-safe/50 py-2 text-[12px] text-safe hover:bg-safe/10 disabled:opacity-40">
                  Acknowledge
                </button>
                <button className="flex-1 rounded-md border border-high/50 py-2 text-[12px] text-high hover:bg-high/10">Dispatch</button>
              </div>
            </Panel>
          ) : (
            <Panel title="Alert Detail" icon="CircleAlert" bodyClass="grid place-items-center h-full">
              <span className="es-kicker text-faint py-8">Select an alert</span>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailRow({ l, v }) {
  return (
    <div className="rounded border border-hairline bg-panel px-2 py-1.5">
      <div className="text-[9px] font-mono text-faint tracking-wider">{l.toUpperCase()}</div>
      <div className="text-ink text-[12px]">{v || '—'}</div>
    </div>
  )
}