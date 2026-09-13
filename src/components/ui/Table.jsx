import { Icon } from './Icon.jsx'
import { EmptyState } from './Primitives.jsx'

// Column definition helper
export const col = (key, header, opts = {}) => ({ key, header, ...opts })

export function DataTable({ columns, data, rowKey = 'id', onRowClick, empty = 'No records' }) {
  if (!data?.length) return <EmptyState label={empty} />
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            {columns.map((c) => (
              <th key={c.key} className={`es-kicker pb-2 pr-3 font-medium ${c.align === 'right' ? 'text-right' : ''} ${c.className || ''}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr
              key={row[rowKey] ?? ri}
              onClick={() => onRowClick?.(row)}
              className={`border-t border-hairline/60 text-sub hover:bg-raised/60 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`py-2 pr-3 whitespace-nowrap ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.render ? c.render(row, ri) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// value with optional up/down movement arrow
export function Delta({ value, suffix = '' }) {
  const up = value > 0
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs" style={{ color: up ? '#34D399' : '#F87171' }}>
      <Icon name={up ? 'ArrowUpRight' : 'ArrowDownRight'} size={12} />
      {Math.abs(value)}
      {suffix}
    </span>
  )
}