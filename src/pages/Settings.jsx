import { useState } from 'react'
import { Panel, Tag, Divider, StatusDot } from '../components/ui/Primitives.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { SATELLITE_SOURCES } from '../data/satellite.js'
import { SEISMIC_DISCLAIMER } from '../data/seismic.js'

export default function Settings() {
  const [thresholds, setThresholds] = useState({ flood: 55, fire: 55, heat: 55, drought: 55, aqi: 150 })

  return (
    <div className="space-y-3 animate-[fadeUp_.4s_ease] max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Panel title="Organization Profile" icon="Building2" bodyClass="p-4 space-y-3">
          <Field label="Agency" value="National Disaster Management Authority (NDMA)" />
          <Field label="Command Region" value="Republic of India — All States & UTs" />
          <Field label="Deployment" value="Production Grid v2.4.1" />
          <Field label="Operator" value="Command & Control Operations" />
        </Panel>

        <Panel title="System Status" icon="Gauge" bodyClass="p-4">
          <div className="space-y-2.5">
            {[
              { l: 'AI Prediction Engine', ok: true },
              { l: 'IoT Sensor Mesh', ok: true },
              { l: 'Geospatial Grid (GIS)', ok: true },
              { l: 'Alert Distribution Bus', ok: true },
              { l: 'Satellite Feed Ingest', ok: true, note: 'integration-ready' },
              { l: 'Citizen Reporting API', ok: true },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-2.5">
                <StatusDot color={s.ok ? '#22C55E' : '#EF4444'} pulse={s.ok} />
                <span className="flex-1 text-[13px] text-ink">{s.l}</span>
                {s.note && <Tag color="#EAB308">{s.note}</Tag>}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Alert Thresholds" icon="TriangleAlert" bodyClass="p-4 space-y-3">
        <p className="text-[12px] text-sub">Thresholds define when AI escalates a region to HIGH / CRITICAL. Adjust per hazard (demo controls).</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Threshold label="Flood Risk" value={thresholds.flood} min={30} max={90} onChange={(v) => setThresholds((s) => ({ ...s, flood: v }))} icon="Waves" />
          <Threshold label="Forest Fire Risk" value={thresholds.fire} min={30} max={90} onChange={(v) => setThresholds((s) => ({ ...s, fire: v }))} icon="Flame" />
          <Threshold label="Heatwave Risk" value={thresholds.heat} min={30} max={90} onChange={(v) => setThresholds((s) => ({ ...s, heat: v }))} icon="ThermometerSun" />
          <Threshold label="Drought Risk" value={thresholds.drought} min={30} max={90} onChange={(v) => setThresholds((s) => ({ ...s, drought: v }))} icon="SunDim" />
        </div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Panel title="Data Integrations" icon="Satellite" bodyClass="p-3">
          <div className="space-y-2">
            {SATELLITE_SOURCES.map((s) => (
              <div key={s.key} className="flex items-center gap-2.5 rounded border border-hairline bg-panel px-3 py-2.5">
                <Icon name="Satellite" size={15} className="text-electric" />
                <span className="flex-1 text-[13px] text-ink">{s.label}</span>
                <Tag color="#22C55E">READY</Tag>
              </div>
            ))}
            {[
              { l: 'NCS Seismic Feed', i: 'Activity' },
              { l: 'USGS Earthquake Feed', i: 'Globe' },
              { l: 'IMD Weather Grid', i: 'Wind' },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-2.5 rounded border border-hairline bg-panel px-3 py-2.5">
                <Icon name={s.i} size={15} className="text-electric" />
                <span className="flex-1 text-[13px] text-ink">{s.l}</span>
                <Tag color="#22C55E">READY</Tag>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Compliance & Disclaimer" icon="CircleAlert" bodyClass="p-4">
          <div className="rounded-md border border-high/40 bg-panel p-3 flex gap-2.5">
            <Icon name="CircleAlert" size={16} className="text-high shrink-0" />
            <p className="text-[12px] text-sub leading-relaxed">{SEISMIC_DISCLAIMER}</p>
          </div>
          <p className="text-[12px] text-sub leading-relaxed mt-3">
            EcoSentinel AI is a monitoring, risk-assessment and decision-support platform. Actions remain with authorized government authorities.
          </p>
        </Panel>
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div className="es-kicker text-faint mb-0.5">{label.toUpperCase()}</div>
      <div className="text-[14px] text-ink">{value}</div>
    </div>
  )
}

function Threshold({ label, value, min, max, onChange, icon }) {
  return (
    <div className="rounded-md border border-hairline bg-panel p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon name={icon} size={14} className="text-electric" />
        <span className="flex-1 text-[13px] text-ink">{label}</span>
        <span className="font-mono text-[13px]" style={{ color: value >= 75 ? '#EF4444' : '#F97316' }}>{value}</span>
      </div>
      <input type="range" min={min} max={90} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#2C8CFF]" />
    </div>
  )
}