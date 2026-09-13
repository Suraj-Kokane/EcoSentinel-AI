import React from 'react'
import { Icon } from './Icon.jsx'

// Panel: standard titled container with header + optional action node.
export function Panel({ title, icon, actions, children, className = '', bodyClass = '', frame = false, dense = false }) {
  return (
    <section
      className={`es-panel ${frame ? 'corner-frame' : ''} ${className}`}
      style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
    >
      {(title || actions) && (
        <header className={`es-panel-header ${dense ? 'py-1.5' : ''}`}>
          <div className="flex items-center gap-2 min-w-0">
            {icon && <Icon name={icon} size={14} className="text-electric shrink-0" />}
            {title && (
              <h3 className="es-title truncate">{title}</h3>
            )}
          </div>
          {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={`flex-1 min-h-0 ${bodyClass || 'p-3'}`}>{children}</div>
    </section>
  )
}

export function StatusDot({ color = '#22C55E', pulse = false, size = 8 }) {
  return (
    <span
      className={`inline-block rounded-full ${pulse ? 'pulse-ring' : ''}`}
      style={{ width: size, height: size, background: color, boxShadow: `0 0 8px ${color}` }}
    />
  )
}

export function Tag({ children, color = '#2C8CFF', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] leading-none ${className}`}
      style={{ color, background: `${color}1a`, border: `1px solid ${color}40` }}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ value, color, className = '', height = 6, track = 'rgba(255,255,255,0.06)' }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full rounded-full overflow-hidden ${className}`} style={{ height, background: track }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${v}%`, background: color }}
      />
    </div>
  )
}

export function Stat({ label, value, unit, color = '#E6F0FF', mono = true }) {
  return (
    <div className="flex flex-col">
      <span className="es-kicker uppercase">{label}</span>
      <span className={`flex items-baseline gap-1 text-lg leading-tight ${mono ? 'font-mono' : ''}`} style={{ color }}>
        {value}
        {unit && <span className="text-[11px] text-faint">{unit}</span>}
      </span>
    </div>
  )
}

export function Divider({ className = '' }) {
  return <hr className={`es-hairline ${className}`} />
}

export function EmptyState({ label = 'No data available', icon = 'CircleAlert' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-faint">
      <Icon name={icon} size={22} />
      <span className="es-kicker">{label}</span>
    </div>
  )
}

export function MeterRow({ label, value, color, icon }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-sub">
          {icon && <Icon name={icon} size={13} className="text-faint" />}
          {label}
        </span>
        <span className="font-mono" style={{ color }}>
          {value}
        </span>
      </div>
      <ProgressBar value={value} color={color} height={5} />
    </div>
  )
}