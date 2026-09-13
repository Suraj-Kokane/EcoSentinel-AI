import { z } from 'zod'
import { nodeStatusEnum } from './common.validation.js'

export const createSensorSchema = z.object({
  deviceId: z.string().trim().min(3).max(100),
  location: z.string().trim().max(200).optional().default(''),
  state: z.string().trim().max(100).optional().default(''),
  district: z.string().trim().max(100).optional().default(''),
  battery: z.coerce.number().int().min(0).max(100).optional().default(100),
  signalStrength: z.coerce.number().int().min(-120).max(0).optional().default(-50),
  status: nodeStatusEnum.optional().default('online'),
})

export const createReadingSchema = z.object({
  sensorNodeId: z.string().min(1),
  temperature: z.coerce.number().min(-60).max(70).optional(),
  humidity: z.coerce.number().min(0).max(100).optional(),
  airQuality: z.coerce.number().min(0).max(1000).optional(),
  waterLevel: z.coerce.number().min(0).optional(),
  rainfall: z.coerce.number().min(0).optional(),
  timestamp: z.string().datetime().optional(),
})

export const listSensorSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: nodeStatusEnum.optional(),
  state: z.string().optional(),
})

export default { createSensorSchema, createReadingSchema, listSensorSchema }