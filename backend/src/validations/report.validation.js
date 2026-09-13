import { z } from 'zod'
import { hazardTypeEnum, reportStatusEnum } from './common.validation.js'

export const createReportSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).optional().default(''),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  hazardType: hazardTypeEnum.optional().default('other'),
  status: reportStatusEnum.optional().default('submitted'),
  imageUrl: z.string().trim().url().optional().or(z.literal('')).optional(),
})

export const updateReportSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  hazardType: hazardTypeEnum.optional(),
  status: reportStatusEnum.optional(),
})

export const listReportSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
  q: z.string().optional(),
  hazardType: hazardTypeEnum.optional(),
  status: reportStatusEnum.optional(),
})

export default { createReportSchema, updateReportSchema, listReportSchema }