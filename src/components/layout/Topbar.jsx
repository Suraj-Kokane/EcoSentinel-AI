import { useLocation } from 'react-router-dom'
import { Icon } from '../ui/Icon.jsx'
import { ThreatPill } from '../ui/Badge.jsx'
import { useLive } from '../../store/LiveDataContext.jsx'
import { nowISTDate } from '../../lib/format.js'
import { NAV_SECTIONS } from './Sidebar.jsx'

function currentTitle(pathname) {
  for (const sec of NAV_SECTIONS) {
    for (const it of sec.items) {
      if (it.end ? pathname === it.to : pathname.startsWith(it.to)) return it.label
    }
  }
  return 'EcoSentinel AI'
}

export function Topbar({ onMenu, collapsed, onCollapse }) {
  const loc = useLocation()
  const { clock, alerts } = useLive()
  const active = alerts.filter((a) => a.status === 'active').length

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-hairline bg-deep/90 backdrop-blur px-3 md:px-4 h-[54px]">
      <button onClick={onMenu} className="lg:hidden text-sub hover:text-ink" aria-label="menu">
        <Icon name="LayoutDashboard" size={20} />
      </button>

      <button
        onClick={onCollapse}
        className="hidden lg:grid place-items-center h-8 w-8 rounded-md text-sub hover:text-ink hover:bg-raised/60"
        aria-label="collapse sidebar"
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <Icon name={collapsed ? 'ChevronRight' : 'ChevronRight'} size={18} className={collapsed ? '' : 'rotate-180'} />
      </button>

      <div className="min-w-0">
        <div className="es-kicker text-faint hidden sm:block">ECO SENTINEL / COMMAND</div>
        <h1 className="font-display font-semibold text-[17px] leading-tight truncate">{currentTitle(loc.pathname)}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <ThreatPill level="ELEVATED" color="#F97316" />

        <div className="hidden md:flex items-center gap-2 rounded-md px-2.5 py-1.5 border border-hairline bg-panel">
          <Icon name="Bell" size={14} className="text-electric" />
          <span className="font-mono text-[11px] text-sub">
            {active} <span className="text-faint">ACTIVE</span>
          </span>
        </div>

        <div className="hidden sm:block text-right leading-tight">
          <div className="font-mono text-[13px] text-ink tabular-nums">{clock} IST</div>
          <div className="es-kicker text-faint">{nowISTDate()}</div>
        </div>

        <div className="grid place-items-center h-8 w-8 rounded-full border border-hairline bg-raised">
          <Icon name="User" size={16} className="text-sub" />
        </div>
      </div>
    </header>
  )
}