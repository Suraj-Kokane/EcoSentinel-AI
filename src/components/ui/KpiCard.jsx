import { scoreColor, scoreLabel } from '../../lib/risk.js'
import { Icon } from './Icon.jsx'
import { TrendPill } from './Badge.jsx'

// Large command-center KPI card.
export function KpiCard({ label, value, unit, icon, accent = '#2C8CFF', sub, trend, trendDir = 'up', valueColor, spark }) {
  return (
    <div className="es-panel relative overflow-hidden p-3.5 h-full" style={{ borderTopColor: accent }}>
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}, transparent 70%)` }} />
      <div className="flex items-center justify-between mb-1">
        <span className="es-title">{label}</span>
        {icon && <Icon name={icon} size={15} style={{ color: accent }} />}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1 min-w-0">
          <span
            className="font-display font-bold text-[30px] leading-none tabular-nums"
            style={{ color: valueColor || accent }}
          >
            {value}
          </span>
          {unit && <span className="text-[11px] font-mono text-faint">{unit}</span>}
        </div>
        {trend !== undefined && <TrendPill value={trend} dir={trendDir} />}
      </div>
      {sub && <div className="mt-1.5 text-[11px] text-faint truncate">{sub}</div>}
      {spark && (
        <div className="mt-2 h-7 opacity-70">
          <MiniBars data={spark} color={accent} />
        </div>
      )}
    </div>
  )
}

function MiniBars({ data, color }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-[2px] h-full w-full">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.25 + 0.7 * (v / max) }}
        />
      ))}
    </div>
  )
}

export { scoreColor, scoreLabel }