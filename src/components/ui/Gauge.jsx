import { scoreColor, scoreLabel } from '../../lib/risk.js'
import { ehiGrade } from '../../lib/ehi.js'

// Radial risk gauge (0–100). Reused for risk scores and EHI.
export function RiskGauge({ score, label = 'RISK', size = 120, stroke = 9, valueColor }) {
  const s = Math.max(0, Math.min(100, score))
  const color = valueColor || scoreColor(s)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const filled = (s / 100) * c
  const center = size / 2
  const band = scoreLabel(s)

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dasharray .6s cubic-bezier(.16,1,.3,1)', filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
        <text x={center} y={center - 2} textAnchor="middle" fill={color} className="font-display" style={{ fontSize: size * 0.24, fontWeight: 700 }}>
          {Math.round(s)}
        </text>
        <text x={center} y={center + 14} textAnchor="middle" fill="#54719B" className="font-mono" style={{ fontSize: size * 0.085 }}>
          {band}
        </text>
      </svg>
      {label && (
        <span className="mt-1 es-kicker uppercase" style={{ fontSize: 9 }}>
          {label}
        </span>
      )}
    </div>
  )
}

// EHI-specific gauge (higher = healthier; label via ehiGrade)
export function EhiGauge({ score, size = 120 }) {
  const g = ehiGrade(score)
  return <RiskGauge score={score} label="EHI" size={size} valueColor={g.color} />
}

// tiny inline sparkline (SVG polyline)
export function Sparkline({ data, color = '#2C8CFF', width = 90, height = 28, fill = true }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const px = (i) => (i / (data.length - 1)) * (width - 2) + 1
  const py = (v) => height - 2 - ((v - min) / range) * (height - 6)
  const pts = data.map((v, i) => `${px(i)},${py(v)}`).join(' ')
  return (
    <svg width={width} height={height} className="block">
      {fill && <polygon points={`${px(0)},${height} ${pts} ${px(data.length - 1)},${height}`} fill={color} opacity={0.12} />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={px(data.length - 1)} cy={py(data[data.length - 1])} r={2.2} fill={color} />
    </svg>
  )
}

// vertical bars sparkline variant
export function Bars({ data, color = '#2C8CFF', width = 90, height = 28 }) {
  const max = Math.max(...data, 1)
  const bw = (width - 2) / data.length - 1
  return (
    <svg width={width} height={height} className="block">
      {data.map((v, i) => {
        const h = (v / max) * (height - 2)
        return <rect key={i} x={1 + i * (bw + 1)} y={height - h} width={bw} height={h} rx={1} fill={color} opacity={0.4 + 0.6 * (v / max)} />
      })}
    </svg>
  )
}