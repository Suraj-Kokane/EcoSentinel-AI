import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created } from '../utils/response.js'
import * as sensorService from '../services/sensor.service.js'

export const listSensors = asyncHandler(async (req, res) => {
  const result = await sensorService.listSensors(req.query)
  return ok(res, result.data, result.meta)
})

export const registerSensor = asyncHandler(async (req, res) => {
  const node = await sensorService.registerSensor(req.body)
  return created(res, node)
})

export const listReadings = asyncHandler(async (req, res) => {
  const result = await sensorService.listReadings(req.query)
  return ok(res, result.data, result.meta)
})

export const createReading = asyncHandler(async (req, res) => {
  const reading = await sensorService.createReading(req.body)
  return created(res, reading)
})

export default { listSensors, registerSensor, listReadings, createReading }