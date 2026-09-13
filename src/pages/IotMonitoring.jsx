import { useMemo, useState } from 'react'
import { Panel, Tag, StatusDot } from '../components/ui/Primitives.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { OnlinePill } from '../components/ui/Badge.jsx'
import { DataTable, col } from '../components/ui/Table.jsx'
import { KpiCard } from '../components/ui/KpiCard.jsx'
import { IOT_TYPES, iotSummary } from '../data/iot.js'
import { useLive } from '../store/LiveDataContext.jsx'

const TYPE_COLOR = {
  gateway: '#22D3EE',
  water: '#38BDF8',
  air: '#A855F7',
  rain: '#2C8CFF',
  temp: '#F97316',
  gps: '#34D399',
}

export default function IotMonitoring() {
  const { nodes } = useLive()
  const [sel, setSel] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')

  const sum = useMemo(() => iotSummary(nodes), [nodes])
  const filtered = typeFilter === 'all' ? nodes : nodes.filter((n) => n.type === typeFilter)

  const layout = useMemo(() => {
    const gateways = nodes.filter((n) => n.type === 'gateway')
    const sensors = nodes.filter((n) => n.type !== 'gateway')
    const C = { x: 350, y: 235 }
    const pt = (angle, r) => ({ x: C.x + r * Math.cos(angle), y: C.y + r * Math.sin(angle) })
    const g = gateways.map((n, i) => ({ node: n, ...pt((i / gateways.length) * 2 * Math.PI - Math.PI / 2, 78) }))
    const s = sensors.map((n, i) => {
      const rr = 165 + (i % 3) * 26
      const a = (i / sensors.length) * 2 * Math.PI - Math.PI / 2
      return { node: n, ...pt(a, rr), gateway: g.length ? g[i % g.length] : null }
    })
    return { C, gateways: g, sensors: s }
  }, [nodes])

  const selected = sel ? nodes.find((n) => n.id === sel) : null

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease]">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Nodes" value={sum.total} accent="#2C8CFF" icon="Antenna" />
        <KpiCard label="Online" value={sum.online} accent="#22C55E" icon="Radio" />
        <KpiCard label="Offline" value={sum.offline} accent="#EF4444" icon="CircleAlert" />
        <KpiCard label="Gateways" value={sum.gateways} accent="#22D3EE" icon="Router" />
        <KpiCard label="Low Battery" value={sum.lowBattery} accent="#EAB308" icon="Battery" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3">
        {/* topology */}
        <Panel title="Network Topology" icon="Router" actions={<Tag color="#22C55E">LIVE</Tag>} bodyClass="p-2">
          <svg viewBox="0 0 700 470" className="w-full" style={{ maxHeight: 520 }}>
            {/* link lines */}
            {layout.sensors.map((s, i) =>
              s.gateway ? (
                <line key={'l' + i} x1={s.x} y1={s.y} x2={s.gateway.x} y2={s.gateway.y} stroke={s.node.status === 'online' ? 'rgba(44,140,255,0.18)' : 'rgba(239,68,68,0.12)'} strokeWidth="1" />
              ) : null,
            )}
            {layout.gateways.map((g, i) => (
              <line key={'g' + i} x1={g.x} y1={g.y} x2={layout.C.x} y2={layout.C.y} stroke="rgba(34,211,238,0.3)" strokeWidth="1.4" />
            ))}

            {/* central uplink */}
            <g>
              <circle cx={layout.C.x} cy={layout.C.y} r={16} fill="#0e2038" stroke="#22D3EE" strokeWidth="1.5" />
              <text x={layout.C.x} y={layout.C.y - 24} textAnchor="middle" fill="#22D3EE" fontSize="9" fontFamily="monospace">SATELLITE UPLINK</text>
              <text x={layout.C.x} y={layout.C.y + 4} textAnchor="middle" fill="#8AA6C8" fontSize="10" fontFamily="monospace">☰</text>
            </g>

            {/* gateways */}
            {layout.gateways.map((g) => (
              <g key={g.node.id} className="cursor-pointer" onClick={() => setSel(g.node.id)}>
                <circle cx={g.x} cy={g.y} r={10} fill={g.node.status === 'online' ? '#0a1526' : '#3a0d0d'} stroke="#22D3EE" strokeWidth="1.5" />
                <circle cx={g.x} cy={g.y} r={3} fill={g.node.status === 'online' ? '#22D3EE' : '#EF4444'} className={g.node.status === 'online' ? 'pulse-ring' : ''} />
                <text x={g.x} y={g.y + 20} textAnchor="middle" fill="#8AA6C8" fontSize="8" fontFamily="monospace">{g.node.name}</text>
              </g>
            ))}

            {/* sensors */}
            {layout.sensors.map((s) => (
              <g key={s.node.id} className="cursor-pointer" onClick={() => setSel(s.node.id)}>
                {selected?.id === s.node.id && (
                  <circle cx={s.x} cy={s.y} r={13} fill="none" stroke="#FFF" strokeWidth="1" opacity={0.5} />
                )}
                <circle cx={s.x} cy={s.y} r={5.5} fill={TYPE_COLOR[s.node.type]} fillOpacity={s.node.status === 'online' ? 0.28 : 0.1} stroke={s.node.status === 'online' ? TYPE_COLOR[s.node.type] : '#EF4444'} strokeWidth="1.4" />
                {s.node.status === 'offline' && <line x1={s.x - 3.5} y1={s.y - 3.5} x2={s.x + 3.5} y2={s.y + 3.5} stroke="#EF4444" strokeWidth="1.4" />}
              </g>
            ))}

            <text x="20" y="452" fill="#54719B" fontSize="8" fontFamily="monospace">ESP32 LoRa MESH • 6 GATEWAYS • {sum.total} ENDPOINTS</text>
          </svg>
        </Panel>

        {/* node detail + filters */}
        <div className="space-y-3">
          <Panel title="Node Detail" icon="Gauge" bodyClass="p-3">
            {selected ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-lg text-ink">{selected.name}</span>
                  <OnlinePill online={selected.status === 'online'} />
                </div>
                <div className="flex items-center gap-2">
                  <Tag color={TYPE_COLOR[selected.type]}>{IOT_TYPES.find((t) => t.key === selected.type)?.label}</Tag>
                  <span className="text-[10px] font-mono text-faint">{selected.district}, {selected.state}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <NodeStat label="Reading" value={`${selected.reading} ${selected.unit}`} />
                  <NodeStat label="Battery" value={`${selected.battery}%`} color={selected.battery < 20 ? '#EF4444' : '#22C55E'} />
                  <NodeStat label="Signal (RSSI)" value={`${selected.signal} dBm`} color={selected.signal < -80 ? '#EF4444' : '#22D3EE'} />
                  <NodeStat label="Status" value={selected.status.toUpperCase()} color={selected.status === 'online' ? '#22C55E' : '#EF4444'} />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="Crosshair" size={22} className="text-faint mx-auto mb-2" />
                <span className="es-kicker text-faint">Select a node on the topology</span>
              </div>
            )}
          </Panel>

          <Panel title="Filter" icon="Filter" bodyClass="p-2.5">
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setTypeFilter('all')} className={`rounded px-2 py-1 text-[11px] ${typeFilter === 'all' ? 'text-ink bg-electric/20' : 'text-sub hover:text-ink'}`}>All</button>
              {IOT_TYPES.map((t) => (
                <button key={t.key} onClick={() => setTypeFilter(t.key)} className={`rounded px-2 py-1 text-[11px] ${typeFilter === t.key ? 'text-ink' : 'text-sub hover:text-ink'}`} style={typeFilter === t.key ? { background: `${TYPE_COLOR[t.key]}22` } : {}}>
                  <Icon name={t.icon} size={12} className="inline mr-1" style={{ color: TYPE_COLOR[t.key] }} />
                  {t.label}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* node table */}
      <Panel title={`Endpoint Registry (${filtered.length})`} icon="List" bodyClass="p-2">
        <DataTable
          rowKey="id"
          onRowClick={(r) => setSel(r.id)}
          columns={[
            col('id', 'ID', { render: (r) => <span className="font-mono text-[11px] text-faint">{r.id}</span> }),
            col('type', 'Type', { render: (r) => <Tag color={TYPE_COLOR[r.type]}>{IOT_TYPES.find((t) => t.key === r.type)?.label}</Tag> }),
            col('name', 'Node', { render: (r) => <span className="text-ink">{r.name}</span> }),
            col('location', 'Location', { render: (r) => <span className="font-mono text-[11px] text-faint">{r.district}, {r.state}</span> }),
            col('reading', 'Reading', { render: (r) => <span className="font-mono text-[12px]">{r.reading} <span className="text-faint">{r.unit}</span></span> }),
            col('battery', 'Battery', { render: (r) => <span className="font-mono text-[11px]" style={{ color: r.battery < 20 ? '#EF4444' : '#8AA6C8' }}>{r.battery}%</span> }),
            col('signal', 'Signal', { render: (r) => <span className="font-mono text-[11px]" style={{ color: r.signal < -80 ? '#EF4444' : '#8AA6C8' }}>{r.signal} dBm</span> }),
            col('status', 'Status', { render: (r) => <span className="inline-flex items-center gap-1.5"><StatusDot color={r.status === 'online' ? '#22C55E' : '#EF4444'} pulse={r.status === 'online'} size={6} /><span className="font-mono text-[10px]">{r.status.toUpperCase()}</span></span> }),
          ]}
          data={filtered}
        />
      </Panel>
    </div>
  )
}

function NodeStat({ label, value, color = '#E6F0FF' }) {
  return (
    <div className="rounded-md border border-hairline bg-panel p-2">
      <div className="text-[9px] font-mono text-faint tracking-wider">{label.toUpperCase()}</div>
      <div className="font-display font-bold text-base mt-0.5" style={{ color }}>{value}</div>
    </div>
  )
}