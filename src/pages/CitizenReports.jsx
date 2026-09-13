import { useMemo, useRef, useState } from 'react'
import { RiskMap } from '../components/map/RiskMap.jsx'
import { Panel, Tag, ProgressBar } from '../components/ui/Primitives.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { DataTable, col } from '../components/ui/Table.jsx'
import { SeverityTag } from '../components/ui/Badge.jsx'
import { IncidentClassify } from '../components/report/IncidentClassify.jsx'
import { INCIDENTS, INCIDENT_TYPES } from '../data/incidents.js'
import { useLive } from '../store/LiveDataContext.jsx'
import { fmtTime } from '../lib/format.js'
import { REPORT_COLORS } from '../components/map/mapkit.js'

export default function CitizenReports() {
  const { incidents } = useLive()
  const [filter, setFilter] = useState('all')
  const [toClassify, setToClassify] = useState(null)
  const [fresh, setFresh] = useState([])
  const fileRef = useRef(null)

  const all = [...fresh, ...incidents]
  const filtered = filter === 'all' ? all : all.filter((i) => i.type === filter)

  const counts = useMemo(() => {
    const m = { all: all.length }
    INCIDENT_TYPES.forEach((t) => (m[t.key] = all.filter((i) => i.type === t.key).length))
    return m
  }, [all])

  const pick = (f) => {
    setToClassify({ name: f.name || 'upload.png', size: f.size })
    fileRef.current.value = ''
  }

  const onClassified = (report) => setFresh((p) => [report, ...p])

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease]">
      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-3">
        {/* upload + classification */}
        <div className="space-y-3">
          <Panel title="Report an Incident" icon="MessageSquare" bodyClass="p-3">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]) }}
              onClick={() => fileRef.current?.click()}
              className="grid place-items-center gap-2 rounded-lg border border-dashed border-edge bg-panel/40 py-10 cursor-pointer hover:bg-raised/40 transition-colors"
            >
              <Icon name="Plus" size={22} className="text-electric" />
              <div className="text-[13px] text-ink font-medium">Upload image for AI classification</div>
              <div className="text-[11px] text-faint">Flood · Fire · Pollution · Landslide · Other</div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            </div>

            {toClassify && <IncidentClassify file={toClassify} onDone={(r) => { onClassified(r); }} onCancel={() => setToClassify(null)} />}

            <div className="mt-3">
              <div className="es-kicker text-faint mb-1.5">CATEGORIES</div>
              <div className="flex flex-wrap gap-1.5">
                {INCIDENT_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setFilter(t.key)}
                    className="inline-flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px]"
                    style={{ color: REPORT_COLORS[t.key], background: `${REPORT_COLORS[t.key]}14`, border: `1px solid ${REPORT_COLORS[t.key]}40` }}
                  >
                    {t.label} ({counts[t.key] || 0})
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Processing Status" icon="Radio" bodyClass="p-3 space-y-2">
            {[
              { l: 'Verified', v: all.filter((i) => i.status === 'verified').length, c: '#22C55E' },
              { l: 'Under Review', v: all.filter((i) => i.status === 'review').length, c: '#EAB308' },
              { l: 'Dispatched', v: all.filter((i) => i.status === 'dispatched').length, c: '#22D3EE' },
            ].map((r) => (
              <div key={r.l}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-sub">{r.l}</span>
                  <span className="font-mono" style={{ color: r.c }}>{r.v}</span>
                </div>
                <ProgressBar value={(r.v / (all.length || 1)) * 100} color={r.c} height={5} />
              </div>
            ))}
          </Panel>
        </div>

        {/* map + table */}
        <div className="space-y-3">
          <RiskMap className="h-[380px]" showRail={false} initialOverlays={{ reports: true, seismic: false, infra: false, fire: false }} />

          <Panel title={`Incident Queue (${filtered.length})`} icon="List" bodyClass="p-2">
            <DataTable
              rowKey="id"
              columns={[
                col('id', 'ID', { render: (r) => <span className="font-mono text-[11px] text-faint">{r.id}</span> }),
                col('type', 'Type', { render: (r) => <Tag color={REPORT_COLORS[r.type]}>{r.type.toUpperCase()}</Tag> }),
                col('title', 'Report', { render: (r) => <span className="text-ink">{r.title}</span> }),
                col('location', 'Location', { render: (r) => <span className="font-mono text-[11px] text-faint">{r.district}, {r.state}</span> }),
                col('confidence', 'AI Conf.', { render: (r) => <span className="font-mono text-[11px] text-sub">{Math.round(r.confidence * 100)}%</span> }),
                col('severity', 'Sev', { render: (r) => <SeverityTag severity={r.severity} /> }),
                col('status', 'Status', { render: (r) => <StatusChip s={r.status} /> }),
                col('time', 'Time', { render: (r) => <span className="font-mono text-[10px] text-faint">{fmtTime(r.time)}</span> }),
              ]}
              data={filtered}
            />
          </Panel>
        </div>
      </div>
    </div>
  )
}

function StatusChip({ s }) {
  const m = { verified: ['VERIFIED', '#22C55E'], review: ['REVIEW', '#EAB308'], dispatched: ['DISPATCHED', '#22D3EE'] }[s]
  return <span className="inline-flex items-center gap-1 font-mono text-[10px]" style={{ color: m[1] }}>● {m[0]}</span>
}