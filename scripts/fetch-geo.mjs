// One-time utility: download + simplify India states & districts GeoJSON
// into public/data/. Run: node scripts/fetch-geo.mjs

import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../public/data')
mkdirSync(OUT, { recursive: true })

const SOURCES = {
  states: 'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States',
  districts: 'https://raw.githubusercontent.com/geohacker/india/master/district/india_district.geojson',
}
const TOL = { states: 0.008, districts: 0.018 }

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(120000) })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.text()
}

function round(x, d = 3) { const f = 10 ** d; return Math.round(x * f) / f }

// --- Douglas-Peucker on a position ring (array of [lng,lat]) ---
function dpSimplify(ring, tol) {
  if (ring.length <= 4) return ring
  const pts = ring // [lng,lat] pairs
  const keep = new Array(pts.length).fill(false)
  keep[0] = keep[pts.length - 1] = true
  const stack = [[0, pts.length - 1]]
  const perp = (a, b, p) => {
    const dx = b[0] - a[0], dy = b[1] - a[1]
    if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1])
    const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)
    const tt = Math.max(0, Math.min(1, t))
    return Math.hypot(p[0] - (a[0] + tt * dx), p[1] - (a[1] + tt * dy))
  }
  while (stack.length) {
    const [s, e] = stack.pop()
    let maxD = 0, idx = -1
    for (let i = s + 1; i < e; i++) {
      const d = perp(pts[s], pts[e], pts[i])
      if (d > maxD) { maxD = d; idx = i }
    }
    if (idx !== -1 && maxD > tol) {
      keep[idx] = true
      stack.push([s, idx], [idx, e])
    }
  }
  return pts.filter((_, i) => keep[i])
}

function simplifyGeometry(geom, tol) {
  if (!geom) return geom
  if (geom.type === 'Polygon') return { ...geom, coordinates: geom.coordinates.map((r) => dpSimplify(r, tol)) }
  if (geom.type === 'MultiPolygon') return { ...geom, coordinates: geom.coordinates.map((p) => p.map((r) => dpSimplify(r, tol))) }
  return geom
}

function roundRecursive(o) {
  if (Array.isArray(o)) return o.map(roundRecursive)
  return o
}

function simplify(geojson, tol) {
  const gj = roundRecursive(JSON.parse(JSON.stringify(geojson)), 3)
  if (Array.isArray(gj.features)) {
    for (const f of gj.features) f.geometry = simplifyGeometry(f.geometry, tol)
  }
  return gj
}

function sampleKeys(fc) {
  const f = fc.features?.[0]?.properties || {}
  const names = (fc.features || []).slice(0, 6).map((x) => JSON.stringify(x.properties)).join(' | ')
  return { keys: Object.keys(f), sample: names }
}

async function go() {
  for (const [key, url] of Object.entries(SOURCES)) {
    const tol = TOL[key]
    console.log(`Downloading ${key} (tol ${tol})...`)
    const txt = await fetchText(url)
    let raw = JSON.parse(txt)
    let features = Array.isArray(raw.features) ? raw.features : [raw]
    console.log(`  raw: ${features.length} features, ${Math.round(txt.length / 1024)} KB, geometry ${raw.features?.[0]?.geometry?.type}`)
    console.log('  keys:', JSON.stringify(sampleKeys({ features })))
    const simplified = simplify(raw, tol)
    const out = resolve(OUT, `india-${key}.geojson`)
    const bytes = Buffer.byteLength(JSON.stringify(simplified))
    writeFileSync(out, JSON.stringify(simplified))
    console.log(`  -> ${out} ${Math.round(bytes / 1024)} KB`)
  }
  console.log('DONE')
}

go().catch((e) => { console.error(e); process.exit(1) })