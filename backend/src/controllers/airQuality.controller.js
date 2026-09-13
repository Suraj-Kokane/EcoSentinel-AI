import { asyncHandler } from '../utils/asyncHandler.js'
import { ok } from '../utils/response.js'
import { prisma } from '../config/prisma.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

export const listAirQuality = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = parsePagination(req.query)
  const where = {}
  if (req.query.state) where.state = { equals: req.query.state, mode: 'insensitive' }
  if (req.query.district) where.district = { equals: req.query.district, mode: 'insensitive' }

  const [data, total] = await Promise.all([
    prisma.airQuality.findMany({ where, orderBy: { timestamp: 'desc' }, skip, take }),
    prisma.airQuality.count({ where }),
  ])
  return ok(res, data, buildMeta({ page, limit, total }))
})

export default { listAirQuality }