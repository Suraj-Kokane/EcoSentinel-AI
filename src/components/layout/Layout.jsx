import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar.jsx'
import { Topbar } from './Topbar.jsx'

export function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-abyss">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div
        className={`transition-[padding] duration-200 ${collapsed ? 'lg:pl-[68px]' : 'lg:pl-[236px]'}`}
      >
        <Topbar onMenu={() => setMobileOpen(true)} collapsed={collapsed} onCollapse={() => setCollapsed((c) => !c)} />
        <main className="p-3 md:p-4 max-w-[1800px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}