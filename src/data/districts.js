// District-level intelligence generator. District names & geometries come from
// public/data/india-districts.geojson at runtime; this module derives stable,
// deterministic per-district scores from the parent state baseline.

import { HAZARD_KEYS, overallScore, clamp } from '../lib/risk.js'
import { rand, randInt, rng } from '../lib/prng.js'
import { ehiScore, ehiGrade } from '../lib/ehi.js'

export function buildDistrictData(state, districtName) {
  const seed = `${state.name}|${districtName}`
  const r = rng(seed)

  const scores = {}
  HAZARD_KEYS.forEach((k) => {
    const base = state.scores[k] ?? 0
    // local variance: some hazards more variable by district
    const varHigh = ['flood', 'landslide', 'fire', 'drought', 'infrastructure'].includes(k)
    const spread = varHigh ? 26 : 16
    scores[k] = Math.round(clamp(base + (r() - 0.5) * 2 * spread, 0, 100))
  })

  const overall = overallScore(scores)
  const ehi = ehiScore(scores)

  return {
    name: districtName,
    state: state.name,
    stateLabel: state.label,
    scores,
    overall,
    ehi,
    ehiGrade: ehiGrade(ehi).label,
    alerts: randInt(seed + '|alerts', Math.floor(overall / 12), Math.ceil(overall / 4)),
    population: Math.round(state.population * rand(seed + '|pop', 0.01, 0.2)),
    rainfallAnomaly: Math.round(rand(seed + '|rain', -60, 60)),
    reservoir: Math.round(rand(seed + '|res', 18, 95)),
    soilMoisture: Math.round(rand(seed + '|soil', 18, 92)),
    waterStress: Math.round(rand(seed + '|ws', 15, 90)),
  }
}

// Build a dependency-free district snapshot for a state (no geojson needed).
export function districtNamePreview(state) {
  return ['Central', 'North', 'South', 'East', 'West', 'Coastal', 'Upper', 'Lower']
}

export function districtRanking(state, districtNames) {
  return districtNames
    .map((n) => buildDistrictData(state, n))
    .sort((a, b) => b.overall - a.overall)
}