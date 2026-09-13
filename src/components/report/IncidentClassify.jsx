import { useEffect, useState } from 'react'
import { Panel, Tag, ProgressBar } from '../ui/Primitives.jsx'
import { Icon } from '../ui/Icon.jsx'
import { SeverityTag } from '../ui/Badge.jsx'
import { REPORT_COLORS } from '../map/mapkit.js'
import { hashString, rand, randInt, pick } from '../../lib/prng.js'
import { STATES } from '../../data/states.js'

const STEPS = ['Uploading image', 'Extracting visual features', 'Running hazard classifier', 'Computing severity & confidence']

export function IncidentClassify({ file, onDone, onCancel }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStep((s) => s + 1), 620)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (step >= STEPS.length) {
      const h = hashString(file?.name || String(Date.now()))
      const type = ['flood', 'fire', 'pollution', 'landslide'][h % 4]
      const confidence = Math.round(rand('conf' + h, 0.82, 0.98) * 100) / 100
      const severity = type === 'flood' || type === 'fire' ? randInt('sev' + h, 2, 4) : randInt('sev' + h, 1, 3)
      const st = pick('st' + h, STATES)
      const titles = {
        flood: 'Flooding reported in area',
        fire: 'Fire/smoke detected',
        pollution: 'Pollution observed',
        landslide: 'Landslide / slope movement',
      }
      const report = {
        id: `CR-NEW-${h % 1000}`,
        type,
        title: titles[type],
        desc: 'Auto-classified from citizen upload. Location and severity inferred by the EcoSentinel hazard classifier.',
        state: st.name,
        district: st.label,
        status: 'review',
        confidence,
        severity,
        time: new Date().toISOString(),
        reporter: 'Citizen',
        fresh: true,
      }
      onDone(report)
    }
  }, [step])

  const done = step >= STEPS.length
  const pct = Math.min(100, (step / STEPS.length) * 100)

  return (
    <Panel title="AI Classification" icon="Sparkles" bodyClass="p-3" className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Image" size={14} className="text-electric" />
        <span className="text-[12px] text-sub truncate">{file?.name || 'image.jpg'}</span>
        {file?.size && <span className="text-[10px] font-mono text-faint">{Math.round(file.size / 1024)} KB</span>}
      </div>

      <ProgressBar value={pct} color={done ? '#22C55E' : '#2C8CFF'} height={6} />

      <div className="mt-2 space-y-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 text-[11px] font-mono">
            {i < step ? (
              <Icon name="CheckCircle2" size={13} className="text-safe" />
            ) : i === step ? (
              <Icon name="Loader2" size={13} className="animate-spin text-electric" />
            ) : (
              <span className="h-3 w-3 grid place-items-center"><span className="h-1.5 w-1.5 rounded-full bg-hairline" /></span>
            )}
            <span className={i <= step ? 'text-sub' : 'text-faint'}>{s}</span>
          </div>
        ))}
      </div>

      {done && (
        <div className="mt-3 flex items-center gap-2.5 rounded-md border border-safe/40 bg-panel p-2.5">
          <Icon name="CheckCircle2" size={18} className="text-safe shrink-0" />
          <div className="text-[12px] text-sub">
            Classification complete. The incident was added to the queue for review &amp; dispatch.
          </div>
          <button onClick={onCancel} className="ml-auto text-[11px] text-electric hover:underline shrink-0">Reset</button>
        </div>
      )}
    </Panel>
  )
}