import { asyncHandler } from '../utils/asyncHandler.js'
import { ok } from '../utils/response.js'
import { prisma } from '../config/prisma.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

export const listInfrastructure = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = parsePagination(req.query)
  const where = {}
  if (req.query.type) where.type = req.query.type
  if (req.query.state) where.state = { equals: req.query.state, mode: 'insensitive' }

  const [data, total] = await Promise.all([
    prisma.infrastructure.findMany({ where, orderBy: { riskScore: 'desc' }, skip, take }),
    prisma.infrastructure.count({ where }),
  ])
  return ok(res, data, buildMeta({ page, limit, total }))
})

export default { listInfrastructure }