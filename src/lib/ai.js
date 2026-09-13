// AI Prediction assistant — deterministic, data-driven answer generator.
// Parses free-text queries for state/district + hazard + forecast window, then
// composes structured predictions from the live mock dataset (consistent across
// reloads — no external model calls).

import { HAZARDS, HAZARD_KEYS, overallScore, scoreBand, trendLabel, clamp, round1 } from './risk.js'
import { rng, randInt, rand } from './prng.js'

export const WINDOWS = [
  { key: 'current', label: 'Current' },
  { key: '24h', label: '24 Hours' },
  { key: '3d', label: '3 Days' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
]

// growth/decay multiplier per window for hazard projections
const WINDOW_FACTOR = { current: 1, '24h': 1.06, '3d': 1.14, '7d': 1.22, '30d': 1.28 }

const SUGGESTIONS = [
  'What environmental risks should Maharashtra prepare for this week?',
  'Give me a 24-hour flood outlook for Assam.',
  'Which states face critical heatwave risk in the next 3 days?',
  '7-day cyclone outlook for coastal districts of Odisha.',
  'Drought severity forecast for Rajasthan over 30 days.',
  'Air quality projection for Delhi this week.',
]

export function suggestions() {
  return SUGGESTIONS
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function findRegion(query, regions) {
  const q = ` ${normalize(query)} `
  let best = null
  for (const r of regions) {
    const name = r.name.toLowerCase()
    const label = (r.label || '').toLowerCase()
    if (name && q.includes(` ${name} `)) {
      best = r
      break
    }
    if (label && label !== name && q.includes(` ${label} `)) {
      if (!best) best = r
    }
    if (label && label !== name && q.includes(` ${label.replace(/nct of /, '')} `)) {
      if (!best) best = r
    }
  }
  return best
}

export function findHazards(query) {
  const q = ` ${normalize(query)} `
  const found = []
  HAZARD_KEYS.forEach((k) => {
    const h = HAZARDS[k]
    const terms = [h.label.toLowerCase(), k.toLowerCase()]
    if (h.label.includes(' ')) terms.push(h.label.toLowerCase().replace(' ', ''))
    if (terms.some((t) => q.includes(` ${t} `) || q.includes(t))) found.push(k)
  })
  if (found.length === 0 && /risk|hazard|disaster|environment/.test(q)) {
    found.push('overall')
  }
  return found
}

export function findWindow(query) {
  const q = normalize(query)
  if (/30 ?day/.test(q)) return '30d'
  if (/7 ?day|week|weekly/.test(q)) return '7d'
  if (/3 ?day|72 ?hour/.test(q)) return '3d'
  if (/24 ?hour|tomorrow|next day/.test(q)) return '24h'
  return '7d'
}

// Build a rich prediction card for a hazard in a region at a window.
export function hazardPrediction(region, hazard, window, baseScore) {
  const seed = `${region.name}|${hazard}|${window}`
  const r = rng(seed)
  const factor = WINDOW_FACTOR[window]
  const projected = clamp(Math.round(baseScore * factor * (0.92 + r() * 0.16)), 0, 100)
  const confidence = clamp(Math.round(94 - (window === 'current' ? 0 : window === '24h' ? 3 : window === '3d' ? 7 : window === '7d' ? 11 : 18) - r() * 6), 62, 98)
  const uptrend = projected - baseScore
  const band = scoreBand(projected)
  const drift = uptrend >= 6 ? 'Worsening' : uptrend <= -4 ? 'Improving' : 'Stable'

  const riskFactors = buildRiskFactors(hazard, projected)
  const actions = buildActions(hazard, projected, drift)

  return {
    hazard,
    label: HAZARDS[hazard]?.label || hazard,
    window,
    base: Math.round(baseScore),
    projected,
    delta: uptrend,
    drift,
    band,
    confidence,
    factors: riskFactors,
    actions,
    timeline: buildTimeline(seed, window, baseScore, factor),
  }
}

function buildRiskFactors(hazard, score) {
  const pool = {
    flood: ['High antecedent rainfall', 'River basin saturation', 'Dam reservoir capacity', 'Low-lying districts exposed', 'Monsoon trough position'],
    cyclone: ['Sea surface temperature anomaly', 'Bay of Bengal depression', 'Low vertical wind shear', 'Coastal surge potential'],
    heatwave: ['Persistent high-pressure ridge', 'Night-time temperature anomaly', 'Heat island build-up', 'Delayed monsoon onset'],
    coldWave: ['Western disturbance', 'Cold air advection from NW', 'Fog and radiative cooling'],
    earthquake: ['Seismic zone classification', 'Historical fault activity', 'Structural vulnerability', 'Crustal stress accumulation (monitoring only)'],
    landslide: ['Saturated regolith', 'Steep slope gradient', 'Monsoon-triggered instability', 'Unstable thrust zones'],
    fire: ['Fuel load accumulation', 'Low relative humidity', 'Wind speed forecast', 'Forest-dryness index'],
    airPollution: ['Stubble burning upstream', 'Temperature inversion layer', 'Vehicular + industrial load', 'Stagnant boundary layer'],
    waterPollution: ['Industrial effluent load', 'Low river dilution flow', 'Municipal discharge', 'Eutrophication risk'],
    drought: ['Rainfall deficit anomaly', 'Reservoir storage below norm', 'Soil moisture decline', 'Groundwater depletion curve'],
    infrastructure: ['Asset exposure density', 'Aging energy corridors', 'Flood-prone transport links', 'Single-point failure topology'],
  }
  const arr = pool[hazard] || pool.flood
  const n = score >= 70 ? 4 : 3
  return arr.slice(0, n)
}

function buildActions(hazard, score, drift) {
  const base = {
    flood: ['Issue flood bulletin & alert to district authorities', 'Activate NDRF boat teams at embankments', 'Open relief camps on high ground', 'Monitor reservoir release schedules'],
    cyclone: ['Issue cyclone watch & storm-surge advisory', 'Evacuate low-lying coastal blocks', 'Secure power & telecom infrastructure', 'Pre-position NDRF rescue columns'],
    heatwave: ['Issue heat advisory & closure advisories', 'Extend drinking water supply', 'Set up cooling shelters in cities', 'Advisory for outdoor labour windows'],
    coldWave: ['Issue cold-wave alert to vulnerable districts', 'Open night shelters', 'Advisory for road & rail fog hazards'],
    earthquake: ['Verify NCS/USGS feed & notify', 'Activate structural damage assessment teams', 'Stage search-and-rescue modules', 'Run public safety drills (no prediction claims)'],
    landslide: ['Close vulnerable mountain routes', 'Relocate at-risk slope settlements', 'Deploy geotechnical teams', 'Monitor slope movement sensors'],
    fire: ['Dispatch aerial + ground fire teams', 'Create firebreaks near settlements', 'Evacuate forest-fringe villages', 'Alert forest & fire departments'],
    airPollution: ['Enforce construction & factory curbs', 'Issue health advisory for at-risk groups', 'Restrict stubble burning', 'Enhance public transport frequency'],
    waterPollution: ['Alert pollution control boards', 'Halt upstream effluent discharge', 'Monitor water treatment units', 'Issue safe-water advisory'],
    drought: ['Activate drought relief & fodder camps', 'Tanker water supply schedule', 'Crop insurance & advisories to farmers', 'Reservoir drawdown planning'],
    infrastructure: ['Triage critical asset exposure', 'Shutdown or bypass at-risk segments', 'Stage backup power & telecom', 'Reprioritize maintenance crews'],
  }
  const arr = base[hazard] || base.flood
  const n = score >= 55 ? 4 : 3
  return arr.slice(0, n)
}

function buildTimeline(seed, window, baseScore, factor) {
  const r = rng(seed + '|tl')
  const steps = window === 'current' ? 6 : window === '24h' ? 8 : window === '3d' ? 9 : window === '7d' ? 7 : 10
  const labels =
    window === '30d'
      ? ['D1', 'D3', 'D6', 'D9', 'D12', 'D15', 'D18', 'D21', 'D24', 'D30']
      : window === '7d'
        ? ['Today', 'D1', 'D2', 'D3', 'D4', 'D5', 'D7']
        : window === '3d'
          ? ['Now', '06h', '12h', '18h', '24h', '36h', '48h', '60h', '72h']
          : window === '24h'
            ? ['Now', '03h', '06h', '09h', '12h', '15h', '18h', '24h']
            : ['Now', '01h', '02h', '03h', '04h', '06h']
  return labels.map((l, i) => {
    const drift = (i / (labels.length - 1)) * (factor - 1) * baseScore
    const noise = (r() - 0.5) * 8
    return { t: l, v: clamp(Math.round(baseScore + drift * 1.4 + noise), 0, 100) }
  })
}

// Compose the full assistant answer structure.
export function composeAnswer(query, regions) {
  const norm = normalize(query)
  const region = findRegion(query, regions)
  const window = findWindow(query)
  let hazards = findHazards(query)

  const scope = region || { name: 'India', label: 'India', type: 'Nation', national: true }

  // resolve hazards to concrete list
  let hazardEntries
  if (hazards.includes('overall')) {
    if (region && region.scores) {
      hazardEntries = HAZARD_KEYS.map((k) => [k, region.scores[k] ?? 0]).sort((a, b) => b[1] - a[1]).slice(0, 4)
    } else {
      hazardEntries = [
        ['flood', 72], ['heatwave', 68], ['cyclone', 60], ['drought', 55],
      ]
    }
  } else if (hazards.length === 0) {
    const scores = region.scores || {}
    hazardEntries = HAZARD_KEYS.filter((k) => (scores[k] ?? 0) >= 55).map((k) => [k, scores[k]])
    if (hazardEntries.length === 0)
      hazardEntries = HAZARD_KEYS.map((k) => [k, scores[k] ?? 20]).sort((a, b) => b[1] - a[1]).slice(0, 3)
  } else {
    hazardEntries = hazards.map((h) => {
      const base = region.scores ? region.scores[h] ?? rand(region.name + h, 15, 90) : rand('india' + h, 30, 80)
      return [h, base]
    })
  }

  const predictions = hazardEntries.map(([h, base]) => hazardPrediction(scope, h, window, base))
  const primary = predictions[0]

  return {
    scope,
    window,
    predictions,
    primary,
    summary: buildSummary(scope, predictions, window),
  }
}

function buildSummary(scope, predictions, window) {
  const top = predictions.map((p) => `${p.label} ${p.projected} (${p.drift.toLowerCase()})`)
  const critical = predictions.filter((p) => p.projected >= 75).length
  return `${scope.name} faces ${critical > 0 ? critical + ' critical ' : ''}environmental threat${predictions.length > 1 ? 's' : ''} in the ${window === 'current' ? 'current' : 'next ' + WINDOWS.find((w) => w.key === window).label.toLowerCase()} window: ${top.join('; ')}.`
}