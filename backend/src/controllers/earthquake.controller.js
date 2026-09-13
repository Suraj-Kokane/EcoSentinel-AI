import { asyncHandler } from '../utils/asyncHandler.js'
import { ok } from '../utils/response.js'
import { prisma } from '../config/prisma.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

export const listEarthquakes = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = parsePagination(req.query)
  const [data, total] = await Promise.all([
    prisma.earthquake.findMany({ orderBy: { eventTime: 'desc' }, skip, take }),
    prisma.earthquake.count(),
  ])
  return ok(res, data, buildMeta({ page, limit, total }))
})

export default { listEarthquakes }