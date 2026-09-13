// Environmental Health Index (EHI) — explainable 0–100 composite score.
// EHI = 0.25·AirQuality + 0.20·WaterQuality + 0.25·(100−DisasterRisk)
//        + 0.15·VegetationHealth + 0.15·TemperatureStability
// Documented in DESIGN.md.

import { clamp, HAZARD_KEYS, scoreColor, scoreBand } from './risk.js'

const DISASTER_KEYS = ['flood', 'cyclone', 'heatwave', 'coldWave', 'earthquake', 'landslide', 'fire', 'drought']

const W = { air: 0.25, water: 0.2, disaster: 0.25, veg: 0.15, temp: 0.15 }

export function ehiComponents(scores) {
  const airQuality = clamp(100 - (scores.airPollution ?? 0), 0, 100)
  const waterQuality = clamp(100 - (scores.waterPollution ?? 0), 0, 100)
  const disasterRisk =
    DISASTER_KEYS.reduce((a, k) => a + (scores[k] ?? 0), 0) / DISASTER_KEYS.length
  const vegetation = clamp(100 - (scores.fire ?? 0) * 0.5 - (scores.drought ?? 0) * 0.5, 0, 100)
  const tempAnomaly = ((scores.heatwave ?? 0) + (scores.coldWave ?? 0)) / 2
  const tempStability = clamp(100 - tempAnomaly, 0, 100)
  return { airQuality, waterQuality, disasterRisk, vegetation, tempStability }
}

export function ehiScore(scores) {
  const c = ehiComponents(scores)
  const v =
    W.air * c.airQuality +
    W.water * c.waterQuality +
    W.disaster * (100 - c.disasterRisk) +
    W.veg * c.vegetation +
    W.temp * c.tempStability
  return Math.round(clamp(v, 0, 100))
}

// grade bands for EHI (higher = healthier)
export function ehiGrade(score) {
  if (score >= 80) return { label: 'HEALTHY', color: '#22C55E' }
  if (score >= 65) return { label: 'GOOD', color: '#22D3EE' }
  if (score >= 50) return { label: 'MODERATE', color: '#EAB308' }
  if (score >= 35) return { label: 'STRESSED', color: '#F97316' }
  return { label: 'CRITICAL', color: '#EF4444' }
}

export function ehiBreakdown(scores) {
  const c = ehiComponents(scores)
  return [
    { key: 'Air Quality', value: Math.round(c.airQuality), w: W.air, color: scoreColor(100 - c.airQuality) },
    { key: 'Water Quality', value: Math.round(c.waterQuality), w: W.water, color: scoreColor(100 - c.waterQuality) },
    { key: 'Disaster Resilience', value: Math.round(100 - c.disasterRisk), w: W.disaster, color: scoreColor(c.disasterRisk) },
    { key: 'Vegetation Health', value: Math.round(c.vegetation), w: W.veg, color: scoreColor(100 - c.vegetation) },
    { key: 'Temperature Stability', value: Math.round(c.tempStability), w: W.temp, color: scoreColor(100 - c.tempStability) },
  ]
}

export function hazardScoreFor(scores, key) {
  return scores[key] ?? 0
}

// national averaging across a list of {scores} objects
export function nationalEHI(entries) {
  const n = entries.length || 1
  const scores = {}
  HAZARD_KEYS.forEach((k) => {
    const sum = entries.reduce((a, e) => a + (e.scores?.[k] ?? 0), 0)
    scores[k] = Math.round(sum / n)
  })
  return ehiScore(scores)
}

// band for a raw score within EHI context
export function bandLabel(score) {
  return scoreBand(score).level
}