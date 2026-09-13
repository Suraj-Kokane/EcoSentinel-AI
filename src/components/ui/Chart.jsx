import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Panel } from './Primitives.jsx'

const AXIS = { stroke: '#54719B', fontSize: 10, fontFamily: 'JetBrains Mono' }
const GRID = 'rgba(22,48,79,0.5)'

function darkTooltip(props) {
  const { active, payload, label } = props
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-edge bg-raised px-2.5 py-1.5 shadow-xl">
      {label !== undefined && <div className="font-mono text-[10px] text-faint mb-0.5">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color || p.fill }} />
          <span className="text-sub">{p.name}:</span>
          <span style={{ color: p.color || p.fill }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// Wrapper that handles responsive sizing + panel chrome for every chart.
export function ChartCard({ title, icon, actions, children, className = '', bodyClass = '', height = 220 }) {
  return (
    <Panel title={title} icon={icon} actions={actions} className={className} bodyClass={bodyClass}>
      <div style={{ height }}>{children}</div>
    </Panel>
  )
}

export function AreaChartCard({ data, keys, colors, height = 220, xKey = 'month', yKey = 'value' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
        <defs>
          {keys.map((k) => (
            <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[k]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={colors[k]} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip content={darkTooltip} />
        {keys.map((k) => (
          <Area key={k} type="monotone" dataKey={k} stroke={colors[k]} strokeWidth={2} fill={`url(#g-${k})`} name={k} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function LineChartCard({ data, keys, colors, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} dot={false} />
        <Tooltip content={darkTooltip} />
        <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
        {keys.map((k) => (
          <Line key={k} type="monotone" dataKey={k} stroke={colors[k]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function BarChartCard({ data, dataKey, color = '#2C8CFF', height = 220, xKey = 'name', horizontal = true }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 4, right: 10, left: horizontal ? 8 : -14, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={!horizontal} vertical={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xKey} tick={{ ...AXIS, fill: '#8AA6C8' }} axisLine={false} tickLine={false} width={120} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip content={darkTooltip} />
        <Bar dataKey={dataKey} radius={[0, 3, 3, 0]} barSize={12}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color || color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RadialGaugeChart({ value, color = '#2C8CFF', label = 'value', max = 100, height = 180 }) {
  const data = [{ name: label, value, fill: color }]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
        <RadialBar dataKey="value" cornerRadius={8} style={{ transition: 'fill .4s' }} />
        <text x="50%" y="46%" textAnchor="middle" fill={color} className="font-display" style={{ fontSize: 28, fontWeight: 700 }}>
          {value}
        </text>
        <text x="50%" y="58%" textAnchor="middle" fill="#54719B" className="font-mono" style={{ fontSize: 10 }}>
          {label}
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ data, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="key" innerRadius="60%" outerRadius="85%" paddingAngle={2} strokeWidth={0}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip content={darkTooltip} />
        <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export { darkTooltip }