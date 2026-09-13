import { useRef, useState } from 'react'
import { Panel, Tag, Divider } from '../components/ui/Primitives.jsx'
import { RiskBadge, SeverityTag } from '../components/ui/Badge.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { RiskGauge } from '../components/ui/Gauge.jsx'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from 'recharts'
import { composeAnswer, suggestions, WINDOWS } from '../lib/ai.js'
import { STATES } from '../data/states.js'
import { scoreColor } from '../lib/risk.js'
import { darkTooltip } from '../components/ui/Chart.jsx'

export default function AIPrediction() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [windowKey, setWindowKey] = useState('7d')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef(null)

  const run = (q) => {
    const text = q || input.trim()
    if (!text) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      const ans = composeAnswer(text + (windowKey ? ' ' + windowKey : ''), STATES)
      setMessages((m) => [...m, { role: 'ai', ans }])
      setThinking(false)
      setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 40)
    }, 760)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-3 h-[calc(100vh-120px)] min-h-[560px]">
      {/* chat panel */}
      <Panel title="AI Prediction Assistant" icon="BrainCircuit" bodyClass="flex flex-col p-3 gap-3" className="h-full">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 && (
            <div className="pt-6">
              <div className="text-center mb-4">
                <div className="grid place-items-center h-12 w-12 mx-auto rounded-full mb-2" style={{ background: 'rgba(44,140,255,0.12)', color: '#2C8CFF' }}>
                  <Icon name="Sparkles" size={24} />
                </div>
                <div className="font-display font-semibold text-lg">EcoSentinel Predictive Engine</div>
                <p className="text-[12px] text-sub max-w-[300px] mx-auto leading-relaxed mt-1">
                  Ask about environmental risk for any state or union territory, across any hazard and forecast window.
                </p>
              </div>
              <div className="space-y-1.5">
                {suggestions().map((s) => (
                  <button key={s} onClick={() => run(s)} className="w-full text-left rounded-md border border-hairline bg-panel px-3 py-2 text-[12px] text-sub hover:text-ink hover:border-edge transition-colors">
                    <Icon name="ArrowUpRight" size={12} className="inline mr-1.5 text-electric" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'user' ? (
                <div className="max-w-[85%] rounded-lg rounded-br-sm px-3 py-2 text-[13px]" style={{ background: 'rgba(44,140,255,0.16)', border: '1px solid rgba(44,140,255,0.3)' }}>
                  {m.text}
                </div>
              ) : (
                <div className="flex gap-2 max-w-[92%]">
                  <div className="grid place-items-center h-7 w-7 rounded-md shrink-0" style={{ background: 'rgba(34,211,238,0.14)', color: '#22D3EE' }}>
                    <Icon name="BrainCircuit" size={15} />
                  </div>
                  <div className="rounded-lg rounded-tl-sm border border-hairline bg-panel px-3 py-2.5">
                    <div className="text-[12px] text-sub leading-relaxed">{m.ans.summary}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {thinking && (
            <div className="flex gap-2">
              <div className="grid place-items-center h-7 w-7 rounded-md" style={{ background: 'rgba(34,211,238,0.14)', color: '#22D3EE' }}>
                <Icon name="BrainCircuit" size={15} />
              </div>
              <div className="rounded-lg border border-hairline bg-panel px-3 py-2.5 flex gap-1.5 items-center">
                <Dot /> <Dot delay=".2s" /> <Dot delay=".4s" />
              </div>
            </div>
          )}
        </div>

        {/* window selector */}
        <div className="flex items-center gap-1 rounded-md border border-hairline p-1">
          {WINDOWS.map((w) => (
            <button key={w.key} onClick={() => setWindowKey(w.key)} className={`flex-1 rounded px-1.5 py-1 text-[10px] font-mono transition-colors ${windowKey === w.key ? 'bg-electric/20 text-ink' : 'text-faint hover:text-sub'}`}>
              {w.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            placeholder="e.g. What risks should Maharashtra prepare for this week?"
            className="flex-1 rounded-md border border-hairline bg-panel px-3 py-2.5 text-[13px] text-ink placeholder:text-faint outline-none focus:border-edge"
          />
          <button onClick={() => run()} className="grid place-items-center h-10 w-10 rounded-md text-ink" style={{ background: '#2C8CFF' }}>
            <Icon name="Send" size={16} />
          </button>
        </div>
      </Panel>

      {/* results panel */}
      <div className="space-y-3 overflow-y-auto h-full pr-0.5">
        {messages.filter((m) => m.role === 'ai').length === 0 ? (
          <Panel title="Prediction Output" bodyClass="grid place-items-center h-full">
            <div className="text-center py-16">
              <Icon name="Radar" size={34} className="text-hairline mx-auto mb-3" />
              <div className="es-title">Awaiting query</div>
              <p className="text-[12px] text-faint mt-1 max-w-[380px] mx-auto">Submit a question or pick a suggestion. Predictions, confidence scores, risk factors and timelines appear here.</p>
            </div>
          </Panel>
        ) : (
          messages
            .filter((m) => m.role === 'ai')
            .map((m, i) => <AnswerBlock key={i} ans={m.ans} />)
        )}
      </div>
    </div>
  )
}

function Dot({ delay = '0s' }) {
  return <span className="h-1.5 w-1.5 rounded-full bg-sub animate-bounce" style={{ animationDelay: delay }} />
}

function AnswerBlock({ ans }) {
  const w = WINDOWS.find((x) => x.key === ans.window)?.label || ans.window
  return (
    <div className="space-y-3 animate-[fadeUp_.3s_ease]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="es-title">{ans.scope.name}</span>
          <Tag>{w.toUpperCase()} OUTLOOK</Tag>
        </div>
        <span className="es-kicker text-faint">{ans.predictions.length} HAZARDS EVALUATED</span>
      </div>

      {ans.predictions.map((p) => (
        <PredictionCard key={p.hazard} p={p} />
      ))}
    </div>
  )
}

function PredictionCard({ p }) {
  const color = scoreColor(p.projected)
  const data = p.timeline.map((t) => ({ t: t.t, v: t.v }))
  return (
    <Panel bodyClass="p-3 md:p-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex items-center gap-4 min-w-[220px]">
          <RiskGauge score={p.projected} label={p.label.toUpperCase()} valueColor={color} size={96} />
          <div>
            <RiskBadge score={p.projected} />
            <div className="mt-2 text-[11px] text-sub">Confidence</div>
            <div className="font-display font-bold text-xl" style={{ color: '#22D3EE' }}>{p.confidence}%</div>
            <div className={`mt-1 inline-flex items-center gap-1 font-mono text-[11px] ${p.drift === 'Worsening' ? 'text-critical' : p.drift === 'Improving' ? 'text-safe' : 'text-sub'}`}>
              <Icon name={p.delta > 4 ? 'ArrowUpRight' : p.delta < -4 ? 'ArrowDownRight' : 'TrendingUp'} size={12} />
              {p.base} → {p.projected} ({p.drift})
            </div>
          </div>
        </div>

        {/* timeline */}
        <div className="flex-1 min-w-[240px]">
          <div className="es-kicker text-faint mb-1">PREDICTION TIMELINE</div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={`g-${p.hazard}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(22,48,79,0.5)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="t" tick={{ stroke: '#54719B', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ stroke: '#54719B', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={darkTooltip} />
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#g-${p.hazard})`} name={p.label} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div>
          <div className="es-kicker text-faint mb-1.5">KEY RISK FACTORS</div>
          <ul className="space-y-1">
            {p.factors.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[12px] text-sub">
                <Icon name="TriangleAlert" size={12} className="text-high mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="es-kicker text-faint mb-1.5">RECOMMENDED ACTIONS</div>
          <ul className="space-y-1">
            {p.actions.map((a, i) => (
              <li key={a} className="flex items-start gap-2 text-[12px] text-sub">
                <span className="font-mono text-[10px] text-electric mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  )
}