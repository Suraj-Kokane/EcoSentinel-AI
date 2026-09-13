import { asyncHandler } from '../utils/asyncHandler.js'
import { ok } from '../utils/response.js'
import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { predictRisk } from '../services/ai/riskPrediction.service.js'
import { recommend } from '../services/ai/recommendation.service.js'
import { scoresFromState } from '../services/ai/deployment.service.js'

// POST /api/ai/predict  { stateId } or { hazards:[{key,base}] , region, window }
export const predict = asyncHandler(async (req, res) => {
  let region = req.body.region || 'India'
  let hazards = req.body.hazards

  if (req.body.stateId) {
    const state = await prisma.state.findUnique({ where: { id: req.body.stateId } })
    if (!state) throw ApiError.notFound('State not found')
    const scores = scoresFromState(state)
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 4)
    hazards = top.map(([key, base]) => ({ key, base }))
    region = state.name
  }

  if (!hazards || !Array.isArray(hazards) || hazards.length === 0) {
    throw ApiError.badRequest('Provide hazards:[{key,base}] or stateId')
  }

  const predictions = predictRisk({ hazards, region, window: req.body.window })
  return ok(res, { region, window: req.body.window || '7d', predictions })
})

// POST /api/ai/recommend  { stateId } | { region, scores }
export const recommendFor = asyncHandler(async (req, res) => {
  let region = req.body.region
  let scores = req.body.scores

  if (req.body.stateId) {
    const state = await prisma.state.findUnique({ where: { id: req.body.stateId } })
    if (!state) throw ApiError.notFound('State not found')
    region = state.name
    scores = scoresFromState(state)
  }

  if (!region || !scores) throw ApiError.badRequest('Provide stateId or {region, scores}')

  const result = recommend({ region, scores })
  return ok(res, result)
})

export default { predict, recommendFor }