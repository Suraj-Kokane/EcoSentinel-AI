import { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react'
import { ALERTS } from '../data/alerts.js'
import { INCIDENTS } from '../data/incidents.js'
import { IOT_NODES } from '../data/iot.js'
import { SEISMIC } from '../data/seismic.js'
import { STATS_POOL } from '../data/livePool.js'
import { clamp } from '../lib/risk.js'
import { nowIST } from '../lib/format.js'

const LiveDataContext = createContext(null)

// A light simulation engine that makes the platform feel live: drifts sensor
// telemetry and occasionally emits a new alert. Deterministic enough for demos.
export function LiveDataProvider({ children }) {
  const [alerts, setAlerts] = useState(ALERTS)
  const [incidents] = useState(INCIDENTS)
  const [seismic] = useState(SEISMIC)
  const [nodes, setNodes] = useState(IOT_NODES)
  const [clock, setClock] = useState(nowIST())
  const tickRef = useRef(0)
  const alertCursor = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1
      setClock(nowIST())

      // drift telemetry
      setNodes((prev) =>
        prev.map((n) => {
          if (n.status === 'offline') return n
          const jitter = (v, amt) => Math.round(clamp(v + (Math.random() - 0.5) * amt, n.vmin ?? 0, n.vmax ?? 9999) * 10) / 10
          const battery = clamp(n.battery - (Math.random() < 0.08 ? 1 : 0), 0, 100)
          const signal = clamp(n.signal + (Math.random() - 0.5) * 4, -100, -30)
          const reading = jitter(n.reading, 6)
          const status = battery <= 3 ? 'offline' : n.status
          return { ...n, battery: Math.round(battery), signal: Math.round(signal), reading, status }
        }),
      )

      // occasionally emit a new alert
      if (Math.random() < 0.16) {
        const p = STATS_POOL[alertCursor.current % STATS_POOL.length]
        alertCursor.current += 1
        const alert = {
          id: `ALT-LIVE-${Date.now()}`,
          severity: p.severity,
          hazard: p.hazard,
          title: p.title,
          state: p.state,
          district: p.district,
          lat: p.lat,
          lng: p.lng,
          time: new Date().toISOString(),
          source: p.source,
          status: 'active',
        }
        setAlerts((prev) => [alert, ...prev].slice(0, 80))
      }
    }, 2600)
    return () => clearInterval(id)
  }, [])

  const value = useMemo(
    () => ({
      alerts,
      incidents,
      seismic,
      nodes,
      clock,
      tick: tickRef.current,
    }),
    [alerts, incidents, seismic, nodes, clock],
  )

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>
}

export function useLive() {
  return useContext(LiveDataContext)
}