import { HAZARDS, scoreBand, rng, clamp, trendLabel } from './risk.js'

export const WINDOWS = {
  current: { label: 'Current', factor: 1 },
  '24h': { label: '24 Hours', factor: 1.06 },
  '3d': { label: '3 Days', factor: 1.14 },
  '7d': { label: '7 Days', factor: 1.22 },
  '30d': { label: '30 Days', factor: 1.28 },
}

const FACTORS = {
  flood: ['High antecedent rainfall', 'River basin saturation', 'Dam reservoir capacity', 'Low-lying districts exposed'],
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

function confidenceForWindow(window) {
  return {
    current: 94,
    '24h': 91,
    '3d': 88,
    '7d': 84,
    '30d': 78,
  }[window]
}

function buildTimeline(seed, window, baseScore, factor) {
  const r = rng(seed)
  const map = {
    current: 6, '24h': 8, '3d': 9, '7d': 7, '30d': 10,
  }
  const steps = map[window]
  const labels = {
    '30d': ['D1', 'D3', 'D6', 'D9', 'D12', 'D15', 'D18', 'D21', 'D24', 'D30'],
    '7d': ['Today', 'D1', 'D2', 'D3', 'D4', 'D5', 'D7'],
    '3d': ['Now', '06h', '12h', '18h', '24h', '36h', '48h', '60h', '72h'],
    '24h': ['Now', '03h', '06h', '09h', '12h', '15h', '18h', '24h'],
    current: ['Now', '01h', '02h', '03h', '04h', '06h'],
  }[window]

  return labels.map((t, i) => {
    const drift = (i / (labels.length - 1)) * (factor - 1) * baseScore
    const noise = (r() - 0.5) * 8
    return { t, v: clamp(Math.round(baseScore + drift * 1.4 + noise), 0, 100) }
  })
}

/**
 * Predict risk for an array of hazards over a forecast window.
 * @param {object} params
 *   - hazards: [{ key, base }]
 *   - region: string (used for deterministic seeding)
 *   - window: 'current'|'24h'|'3d'|'7d'|'30d'
 */
export function predictRisk({ hazards, region = 'India', window = '7d' }) {
  const win = WINDOWS[window] ? window : '7d'
  const factor = WINDOWS[win].factor
  const baseConfidence = confidenceForWindow(win)

  const predictions = hazards.map(({ key, base }) => {
    const seed = `${region}|${key}|${win}`
    const r = rng(seed)
    const projected = clamp(Math.round(base * factor * (0.92 + r() * 0.16)), 0, 100)
    const confidence = clamp(Math.round(baseConfidence - r() * 6), 62, 98)
    const delta = projected - base
    const drift = delta >= 6 ? 'Worsening' : delta <= -4 ? 'Improving' : 'Stable'
    return {
      hazard: key,
      label: HAZARDS[key]?.label || key,
      window: win,
      base: Math.round(base),
      projected,
      delta,
      drift,
      band: scoreBand(projected),
      trend: trendLabel(projected),
      confidence,
      factors: (FACTORS[key] || FACTORS.flood).slice(0, projected >= 70 ? 4 : 3),
      timeline: buildTimeline(seed, win, base, factor),
    }
  })

  return predictions
}

export default { predictRisk, WINDOWS }