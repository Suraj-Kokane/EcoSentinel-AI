import { HAZARD_KEYS, HAZARDS, scoreBand } from './risk.js'

// Produce a narrative recommendation for a region given its 12-hazard scores.
// Rule-based & deterministic; swap the internals for an LLM later without
// changing the return contract.
export function recommend({ region, scores }) {
  const sorted = HAZARD_KEYS.map((key) => ({ key, score: scores[key] ?? 0 })).sort((a, b) => b.score - a.score)
  const top = sorted.slice(0, 3).filter((h) => h.score >= 35)
  const critical = sorted.filter((h) => h.score >= 75).length

  const summary =
    critical > 0
      ? `${region} faces ${critical} critical hazard channel(s) in the current window.`
      : `${region} is in a ${sorted[0].score >= 55 ? 'heightened' : 'stable'} environmental-risk posture.`

  const actions = top.map((h) => ({
    hazard: h.key,
    label: HAZARDS[h.key].label,
    score: h.score,
    band: scoreBand(h.score).label,
  }))

  return {
    region,
    summary,
    topHazards: actions,
    criticalCount: critical,
    priorityTier: sorted[0].score >= 75 ? 'P0 — IMMEDIATE' : sorted[0].score >= 55 ? 'P1 — URGENT' : sorted[0].score >= 35 ? 'P2 — PREPARED' : 'P3 — MONITOR',
  }
}

export default { recommend }