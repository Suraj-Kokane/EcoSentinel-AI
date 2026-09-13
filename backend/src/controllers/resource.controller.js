import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created } from '../utils/response.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'
import { prisma } from '../config/prisma.js'
import { deployResource, recommendDeployment, scoresFromState } from '../services/ai/deployment.service.js'
import { ApiError } from '../utils/ApiError.js'

export const listDeployments = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = parsePagination(req.query)
  const [data, total] = await Promise.all([
    prisma.resourceDeployment.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.resourceDeployment.count(),
  ])
  return ok(res, data, buildMeta({ page, limit, total }))
})

// Create a deployment from explicit inputs (hazard, score, population).
export const createDeployment = asyncHandler(async (req, res) => {
  const { hazardType, score, population } = req.body
  const record = deployResource({ hazard: hazardType, score, population })
  const deployment = await prisma.resourceDeployment.create({
    data: { ...record, hazardType, recommendation: req.body.recommendation || '' },
  })
  return created(res, deployment)
})

// Generate (and persist) an AI deployment recommendation for a state by id.
export const recommendForState = asyncHandler(async (req, res) => {
  const state = await prisma.state.findUnique({ where: { id: req.params.id } })
  if (!state) throw ApiError.notFound('State not found')
  const result = await recommendDeployment({
    region: state.name,
    scores: scoresFromState(state),
    population: undefined,
    persist: true,
  })
  return created(res, result)
})

export default { listDeployments, createDeployment, recommendForState }