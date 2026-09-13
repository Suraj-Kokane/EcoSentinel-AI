import { z } from 'zod'
import { hazardTypeEnum, severityEnum, alertStatusEnum } from './common.validation.js'

export const createAlertSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).optional().default(''),
  state: z.string().trim().max(100).optional().default(''),
  district: z.string().trim().max(100).optional().default(''),
  hazardType: hazardTypeEnum.optional().default('other'),
  severity: severityEnum.optional().default('moderate'),
  status: alertStatusEnum.optional().default('active'),
})

export const updateAlertSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  state: z.string().trim().max(100).optional(),
  district: z.string().trim().max(100).optional(),
  hazardType: hazardTypeEnum.optional(),
  severity: severityEnum.optional(),
  status: alertStatusEnum.optional(),
})

export const listAlertSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
  q: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  hazardType: hazardTypeEnum.optional(),
  severity: severityEnum.optional(),
  status: alertStatusEnum.optional(),
})

export default { createAlertSchema, updateAlertSchema, listAlertSchema }