// AI Resource Deployment Engine — deterministic recommendation of emergency
// assets (NDRF teams, fire brigades, ambulances, relief camps, medical teams)
// scaled by hazard severity + population exposure. Governed by a rule matrix.

import { clamp, scoreBand, HAZARDS } from './risk.js'

// base asset requirements per hazard type, tuned per 10M exposed population
const HAZARD_BASE = {
  flood: { ndrf: 2, brigade: 1, ambulance: 3, camp: 6, medical: 2 },
  cyclone: { ndrf: 3, brigade: 1, ambulance: 2, camp: 8, medical: 3 },
  heatwave: { ndrf: 0, brigade: 0, ambulance: 2, camp: 4, medical: 3 },
  coldWave: { ndrf: 0, brigade: 0, ambulance: 1, camp: 4, medical: 2 },
  earthquake: { ndrf: 4, brigade: 2, ambulance: 4, camp: 10, medical: 4 },
  landslide: { ndrf: 2, brigade: 1, ambulance: 2, camp: 4, medical: 2 },
  fire: { ndrf: 1, brigade: 5, ambulance: 1, camp: 3, medical: 1 },
  airPollution: { ndrf: 0, brigade: 0, ambulance: 1, camp: 2, medical: 3 },
  waterPollution: { ndrf: 0, brigade: 0, ambulance: 1, camp: 3, medical: 2 },
  drought: { ndrf: 0, brigade: 0, ambulance: 0, camp: 6, medical: 2 },
  infrastructure: { ndrf: 2, brigade: 1, ambulance: 2, camp: 5, medical: 2 },
}

function severityMult(score) {
  // 0.5 at safe → ~3.0 at critical
  if (score >= 75) return 3.0
  if (score >= 55) return 2.0
  if (score >= 35) return 1.25
  return 0.5
}

// population (in lakhs) → exposure factor
function exposureFactor(popLakh) {
  if (!popLakh) return 1
  return clamp(1 + Math.log10(popLakh / 10 + 1), 0.6, 3)
}

export function deployResource({ hazard, score, population }) {
  const key = hazard
  const base = HAZARD_BASE[key] || HAZARD_BASE.flood
  const popLakh = (population ?? 10) / 100000
  const m = severityMult(score) * exposureFactor(popLakh)
  const f = (b) => Math.max(0, Math.round(b * m))
  return {
    ndrf: f(base.ndrf),
    brigade: f(base.brigade),
    ambulance: f(base.ambulance),
    camp: f(base.camp),
    medical: f(base.medical),
  }
}

export function deploymentTier(score) {
  const b = scoreBand(score)
  if (b.level === 'critical') return 'P0 — IMMEDIATE'
  if (b.level === 'high') return 'P1 — URGENT'
  if (b.level === 'moderate') return 'P2 — PREPARED'
  return 'P3 — MONITOR'
}

export function deploymentRationale(region, hazard, score) {
  const h = HAZARDS[hazard]?.label || hazard
  const tier = deploymentTier(score)
  return `AI recommends ${tier} posture for ${region}: ${h} risk is at ${Math.round(score)}/100. Pre-position assets at forecast impact zones and standby evacuation corridors within 12 hours.`
}

// Full multi-hazard recommendation for a region: pick top-3 hazards and combine.
export function recommendForRegion(region, scores, population) {
  const entries = Object.entries(scores)
    .filter(([k]) => k !== 'overall')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  const primary = entries[0]
  const resources = deployResource({ hazard: primary[0], score: primary[1], population })
  return {
    primary: { key: primary[0], label: HAZARDS[primary[0]]?.label, score: Math.round(primary[1]) },
    secondary: entries.slice(1).map(([k, v]) => ({ key: k, label: HAZARDS[k]?.label, score: Math.round(v) })),
    resources,
    tier: deploymentTier(primary[1]),
    rationale: deploymentRationale(region, primary[0], primary[1]),
  }
}