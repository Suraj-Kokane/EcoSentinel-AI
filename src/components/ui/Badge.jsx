import { scoreColor, scoreLabel } from '../../lib/risk.js'
import { Icon } from './Icon.jsx'
import { StatusDot } from './Primitives.jsx'

// risk band chip (SAFE / MODERATE / HIGH / CRITICAL)
export function RiskBadge({ score, className = '' }) {
  const color = scoreColor(score)
  const label = scoreLabel(score)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider ${className}`}
      style={{ color, background: `${color}14`, border: `1px solid ${color}45` }}
    >
      <span className="rounded-sm" style={{ width: 7, height: 7, background: color }} />
      {label}
    </span>
  )
}

// severity chip for alerts (1..4)
export function SeverityTag({ severity, className = '' }) {
  const map = {
    1: { label: 'LOW', color: '#22C55E' },
    2: { label: 'MODERATE', color: '#EAB308' },
    3: { label: 'HIGH', color: '#F97316' },
    4: { label: 'CRITICAL', color: '#EF4444' },
  }
  const m = map[severity] || map[2]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${className}`}
      style={{ color: m.color, background: `${m.color}14`, border: `1px solid ${m.color}45` }}
    >
      {m.label}
    </span>
  )
}

// national threat level pill (top bar / dashboard)
export function ThreatPill({ level, color = '#EF4444', label = 'NATIONAL THREAT' }) {
  return (
    <div className="flex items-center gap-2 rounded-md px-3 py-1.5" style={{ background: `${color}12`, border: `1px solid ${color}40` }}>
      <StatusDot color={color} pulse />
      <div className="leading-tight">
        <div className="text-[9px] font-mono tracking-[0.14em] text-faint">{label}</div>
        <div className="font-display font-bold text-sm tracking-wide" style={{ color }}>
          {level}
        </div>
      </div>
    </div>
  )
}

// small delta/trend pill (+4.2% etc.)
export function TrendPill({ value, dir = 'up', negativeGood = false }) {
  const up = dir === 'up'
  const good = up !== negativeGood
  const color = good ? '#22C55E' : '#EF4444'
  const icon = up ? 'ArrowUpRight' : 'ArrowDownRight'
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-[11px]" style={{ color }}>
      <Icon name={icon} size={12} />
      {Math.abs(value)}
    </span>
  )
}

// online/offline pill
export function OnlinePill({ online }) {
  const color = online ? '#22C55E' : '#EF4444'
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px]" style={{ color }}>
      <StatusDot color={color} pulse={online} />
      {online ? 'ONLINE' : 'OFFLINE'}
    </span>
  )
}