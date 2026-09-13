import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created } from '../utils/response.js'
import * as alertService from '../services/alert.service.js'

export const listAlerts = asyncHandler(async (req, res) => {
  const result = await alertService.listAlerts(req.query)
  return ok(res, result.data, result.meta)
})

export const getAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.getAlert(req.params.id)
  return ok(res, alert)
})

export const createAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.createAlert(req.body)
  return created(res, alert)
})

export const updateAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.updateAlert(req.params.id, req.body)
  return ok(res, alert)
})

export const removeAlert = asyncHandler(async (req, res) => {
  const result = await alertService.removeAlert(req.params.id)
  return ok(res, result)
})

export default { listAlerts, getAlert, createAlert, updateAlert, removeAlert }