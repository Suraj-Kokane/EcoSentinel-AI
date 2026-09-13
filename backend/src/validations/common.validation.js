import { z } from 'zod'

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
  q: z.string().optional(),
})

export const hazardTypeEnum = z.enum([
  'flood', 'cyclone', 'heatwave', 'coldWave', 'earthquake', 'landslide',
  'fire', 'airPollution', 'waterPollution', 'drought', 'infrastructure', 'other',
])

export const severityEnum = z.enum(['low', 'moderate', 'high', 'critical'])
export const alertStatusEnum = z.enum(['active', 'acknowledged', 'dispatched', 'resolved'])
export const reportStatusEnum = z.enum(['submitted', 'under_review', 'verified', 'dispatched', 'resolved'])
export const nodeStatusEnum = z.enum(['online', 'offline', 'degraded'])
export const infraTypeEnum = z.enum(['dam', 'hospital', 'school', 'power', 'railway', 'highway', 'airport'])

export default { idParamSchema, paginationQuerySchema }