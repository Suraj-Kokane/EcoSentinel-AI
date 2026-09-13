import { prisma } from '../../config/prisma.js'
import { clamp, scoreBand, HAZARDS, HAZARD_KEYS } from './risk.js'
import { recommend } from './recommendation.service.js'

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

const severityFor = (score) => {
  if (score >= 75) return 'critical'
  if (score >= 55) return 'high'
  if (score >= 35) return 'moderate'
  return 'low'
}

function severityMult(score) {
  if (score >= 75) return 3.0
  if (score >= 55) return 2.0
  if (score >= 35) return 1.25
  return 0.5
}

function exposureFactor(population) {
  if (!population) return 1
  const popLakh = population / 100000
  return clamp(1 + Math.log10(popLakh / 10 + 1), 0.6, 3)
}

export function deployResource({ hazard, score, population }) {
  const base = HAZARD_BASE[hazard] || HAZARD_BASE.flood
  const m = severityMult(score) * exposureFactor(population)
  const f = (b) => Math.max(0, Math.round(b * m))
  return {
    hazardType: hazard === 'airPollution' || hazard === 'waterPollution' ? 'other' : hazard,
    severity: severityFor(score),
    ndrfTeams: f(base.ndrf),
    ambulances: f(base.ambulance),
    fireBrigades: f(base.brigade),
    reliefCamps: f(base.camp),
    medicalTeams: f(base.medical),
  }
}

// Given a region's 12-hazard scores + population, recommend a deployment plan
// (rule-based, deterministic) and persist it.
export async function recommendDeployment({ region, scores, population, persist = true }) {
  const rec = recommend({ region, scores })
  const primary = rec.topHazards[0]

  if (!primary) return { recommendation: rec, deployment: null }

  const deployment = deployResource({ hazard: primary.key, score: primary.score, population })
  const record = {
    ...deployment,
    hazardType: primary.key,
    recommendation: rec.summary,
  }

  if (persist) {
    await prisma.resourceDeployment.create({ data: record })
  }

  return { recommendation: rec, deployment: record }
}

// derive a state's 12-hazard scores from a Prisma State row
export function scoresFromState(state) {
  return {
    flood: state.floodRisk,
    cyclone: state.cycloneRisk,
    heatwave: state.heatwaveRisk,
    coldWave: state.coldWaveRisk,
    earthquake: state.earthquakeRisk,
    landslide: state.landslideRisk,
    fire: state.fireRisk,
    airPollution: state.pollutionRisk,
    waterPollution: state.waterPollutionRisk,
    drought: state.droughtRisk,
    infrastructure: state.infrastructureRisk,
  }
}

export async function listDeployments(query) {
  return prisma.resourceDeployment.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
}

export async function getDeployment(id) {
  return prisma.resourceDeployment.findUnique({ where: { id } })
}

export default { deployResource, recommendDeployment, scoresFromState, listDeployments, getDeployment, HAZARD_KEYS, scoreBand }