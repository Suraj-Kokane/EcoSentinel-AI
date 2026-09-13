// Shared risk/PRNG primitives for the AI service layer. Rule-based and
// deterministic — mirrors the frontend risk engine so backend predictions stay
// consistent with the UI. Swappable later for an LLM (Gemini/OpenAI/…) provider
// without changing the service contract.

export const HAZARD_KEYS = [
  'flood', 'cyclone', 'heatwave', 'coldWave', 'earthquake', 'landslide',
  'fire', 'airPollution', 'waterPollution', 'drought', 'infrastructure',
]

export const HAZARDS = {
  flood: { label: 'Flood', icon: 'Waves' },
  cyclone: { label: 'Cyclone', icon: 'Tornado' },
  heatwave: { label: 'Heatwave', icon: 'ThermometerSun' },
  coldWave: { label: 'Cold Wave', icon: 'Snowflake' },
  earthquake: { label: 'Earthquake', icon: 'Activity' },
  landslide: { label: 'Landslide', icon: 'Mountain' },
  fire: { label: 'Forest Fire', icon: 'Flame' },
  airPollution: { label: 'Air Pollution', icon: 'CloudFog' },
  waterPollution: { label: 'Water Pollution', icon: 'Droplets' },
  drought: { label: 'Drought', icon: 'SunDim' },
  infrastructure: { label: 'Infrastructure', icon: 'Building2' },
}

export const BANDS = [
  { min: 0, max: 35, label: 'SAFE', color: '#22C55E' },
  { min: 35, max: 55, label: 'MODERATE', color: '#EAB308' },
  { min: 55, max: 75, label: 'HIGH', color: '#F97316' },
  { min: 75, max: 101, label: 'CRITICAL', color: '#EF4444' },
]

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export function scoreBand(score) {
  const s = clamp(score, 0, 100)
  return BANDS.find((b) => s >= b.min && s < b.max) || BANDS[BANDS.length - 1]
}

export const scoreColor = (score) => scoreBand(score).color

export function overallScore(scores) {
  const vals = HAZARD_KEYS.map((k) => scores[k] ?? 0)
  const max = Math.max(...vals)
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  return Math.round(max * 0.55 + avg * 0.45)
}

// Deterministic PRNG (FNV-1a hash + mulberry32).
function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function rng(seedStr) {
  let a = hashString(seedStr)
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const trendLabel = (score) =>
  score >= 70 ? 'Severe' : score >= 55 ? 'Worsening' : score >= 35 ? 'Elevated' : 'Stable'

export default { HAZARD_KEYS, HAZARDS, scoreBand, scoreColor, overallScore, rng, clamp, trendLabel }