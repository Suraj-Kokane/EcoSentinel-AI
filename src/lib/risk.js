// Core hazard + risk-scoring model. Single source of truth used by the map,
// KPIs, gauges and drawers.

export const HAZARD_KEYS = [
  'flood',
  'cyclone',
  'heatwave',
  'coldWave',
  'earthquake',
  'landslide',
  'fire',
  'airPollution',
  'waterPollution',
  'drought',
  'infrastructure',
]

export const HAZARDS = {
  flood: { label: 'Flood', icon: 'Waves', cat: 'weather' },
  cyclone: { label: 'Cyclone', icon: 'Tornado', cat: 'weather' },
  heatwave: { label: 'Heatwave', icon: 'ThermometerSun', cat: 'weather' },
  coldWave: { label: 'Cold Wave', icon: 'Snowflake', cat: 'weather' },
  earthquake: { label: 'Earthquake', icon: 'Activity', cat: 'geo' },
  landslide: { label: 'Landslide', icon: 'Mountain', cat: 'geo' },
  fire: { label: 'Forest Fire', icon: 'Flame', cat: 'env' },
  airPollution: { label: 'Air Pollution', icon: 'CloudFog', cat: 'env' },
  waterPollution: { label: 'Water Pollution', icon: 'Droplets', cat: 'env' },
  drought: { label: 'Drought', icon: 'SunDim', cat: 'env' },
  infrastructure: { label: 'Infrastructure', icon: 'Building2', cat: 'infra' },
}

export const LAYER_CATEGORIES = [
  { key: 'weather', label: 'Meteorological' },
  { key: 'geo', label: 'Geological' },
  { key: 'env', label: 'Environmental' },
  { key: 'infra', label: 'Infrastructure' },
]

// risk band thresholds → {label, color}
export const BANDS = [
  { min: 0, max: 35, label: 'SAFE', level: 'safe', color: '#22C55E' },
  { min: 35, max: 55, label: 'MODERATE', level: 'moderate', color: '#EAB308' },
  { min: 55, max: 75, label: 'HIGH', level: 'high', color: '#F97316' },
  { min: 75, max: 101, label: 'CRITICAL', level: 'critical', color: '#EF4444' },
]

export function scoreBand(score) {
  const s = clamp(score, 0, 100)
  return BANDS.find((b) => s >= b.min && s < b.max) || BANDS[BANDS.length - 1]
}

export function scoreColor(score) {
  return scoreBand(score).color
}

export function scoreLabel(score) {
  return scoreBand(score).label
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

export function round1(v) {
  return Math.round(v * 10) / 10
}

// Overall environment/disaster risk for a state — blend of max (dominant hazard)
// and mean (breadth of pressure).
export function overallScore(scores) {
  const vals = HAZARD_KEYS.map((k) => scores[k] ?? 0)
  const max = Math.max(...vals)
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  return Math.round(max * 0.55 + avg * 0.45)
}

// Per-hazard "trend" string, deterministic from a seed.
export function trendLabel(score) {
  if (score >= 70) return 'Severe'
  if (score >= 55) return 'Worsening'
  if (score >= 35) return 'Elevated'
  return 'Stable'
}

export const HAZARD_LABELS = () =>
  HAZARD_KEYS.map((k) => HAZARDS[k].label)

export function hazardList() {
  return HAZARD_KEYS.map((k) => ({ key: k, ...HAZARDS[k] }))
}