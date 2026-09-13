import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '../ui/Icon.jsx'
import { StatusDot } from '../ui/Primitives.jsx'

export const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: 'LayoutDashboard', end: true },
      { to: '/environmental', label: 'Environmental Intelligence', icon: 'Globe' },
      { to: '/risk-map', label: 'National Risk Map', icon: 'Map' },
      { to: '/satellite-intelligence', label: 'Satellite Intelligence', icon: 'Satellite' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/ai-prediction', label: 'AI Prediction Center', icon: 'BrainCircuit' },
      { to: '/disasters', label: 'Disaster Intelligence', icon: 'AlertTriangle' },
      { to: '/analytics', label: 'Analytics', icon: 'BarChart3' },
    ],
  },
  {
    label: 'Field',
    items: [
      { to: '/citizen-reports', label: 'Citizen Reports', icon: 'MessageSquare' },
      { to: '/iot', label: 'IoT Monitoring', icon: 'Antenna' },
      { to: '/infrastructure', label: 'Infrastructure', icon: 'Building2' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/alerts', label: 'Alert Center', icon: 'Bell' },
      { to: '/command-center', label: 'Authority Command Center', icon: 'Siren' },
    ],
  },
  {
    label: 'System',
    items: [{ to: '/settings', label: 'Settings', icon: 'Settings' }],
  },
]

function Logo({ collapsed }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-3 border-b border-hairline">
      <div className="relative grid place-items-center h-9 w-9 shrink-0 rounded-md" style={{ background: 'linear-gradient(135deg, #0e2038, #0a1526)', border: '1px solid #1e3a5f' }}>
        <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
          <path d="M32 10 L52 46 H40 L32 30 L24 46 H12 Z" fill="none" stroke="#2C8CFF" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="32" cy="24" r="3" fill="#22D3EE" />
        </svg>
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <div className="font-display font-bold tracking-[0.08em] text-[15px]">
            ECOSENTINEL<span className="text-electric"> AI</span>
          </div>
          <div className="text-[9px] font-mono tracking-[0.14em] text-faint">NATIONAL INTELLIGENCE GRID</div>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ collapsed, mobileOpen, onClose }) {
  const loc = useLocation()

  return (
    <>
      {/* mobile overlay backdrop */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={onClose} />}

      <aside
        className={`
          fixed z-40 inset-y-0 left-0 flex flex-col bg-deep border-r border-hairline
          transition-all duration-200
          ${collapsed ? 'w-[68px]' : 'w-[236px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Logo collapsed={collapsed} />

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_SECTIONS.map((sec) => (
            <div key={sec.label} className="mb-2">
              {!collapsed && (
                <div className="px-4 pt-2 pb-1 text-[9px] font-mono tracking-[0.18em] text-faint/70">{sec.label.toUpperCase()}</div>
              )}
              {sec.items.map((item) => {
                const active = item.end ? loc.pathname === item.to : loc.pathname.startsWith(item.to)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={`
                      group flex items-center gap-3 mx-2 my-0.5 rounded-md px-2.5 py-2 text-[13px]
                      transition-colors
                      ${active ? 'text-ink' : 'text-sub hover:text-ink hover:bg-raised/50'}
                    `}
                  >
                    <span
                      className="grid place-items-center h-7 w-7 shrink-0 rounded-md transition-colors"
                      style={active ? { background: 'rgba(44,140,255,0.14)', color: '#2C8CFF' } : { color: '#54719B' }}
                    >
                      <Icon name={item.icon} size={17} />
                    </span>
                    {!collapsed && <span className={active ? 'font-medium' : ''}>{item.label}</span>}
                    {active && !collapsed && (
                      <span className="ml-auto h-4 w-[3px] rounded-full bg-electric" />
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-hairline p-3">
          <div className="flex items-center gap-2.5">
            <StatusDot color="#22C55E" pulse />
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-[11px] font-mono text-sub">ALL SYSTEMS OPERATIONAL</div>
                <div className="text-[10px] font-mono text-faint">v2.4.1 • GRID ONLINE</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}