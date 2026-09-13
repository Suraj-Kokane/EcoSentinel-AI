// Formatting helpers for telemetry, timestamps and numbers.

export const n = (v, d = 0) => {
  if (v === null || v === undefined) return '—'
  return Number(v).toLocaleString('en-IN', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })
}

export const compact = (v) => {
  if (v === null || v === undefined) return '—'
  if (v >= 1e7) return (v / 1e7).toFixed(1) + ' Cr'
  if (v >= 1e5) return (v / 1e5).toFixed(1) + ' L'
  if (v >= 1e3) return (v / 1e3).toFixed(1) + ' K'
  return String(v)
}

export const pct = (v, d = 0) => `${n(v, d)}%`

// timestamps relative to now, so demo data always looks fresh
const MIN = 60000
const HOUR = 3600000

export function minsAgo(m) {
  return new Date(Date.now() - m * MIN).toISOString()
}

export function hoursAgo(h, m = 0) {
  return new Date(Date.now() - h * HOUR - m * MIN).toISOString()
}

export function fmtClock(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function fmtTime(iso) {
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    hour12: false,
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function nowIST() {
  return new Date().toLocaleTimeString('en-IN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
}

export function nowISTDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

export function fmtIST(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
}