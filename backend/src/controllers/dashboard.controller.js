import { asyncHandler } from '../utils/asyncHandler.js'
import { ok } from '../utils/response.js'
import * as dashboardService from '../services/dashboard.service.js'

export const overview = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOverview()
  return ok(res, data)
})

export const alerts = asyncHandler(async (req, res) => {
  const result = await dashboardService.getDashboardAlerts(req.query)
  return ok(res, result.data, result.meta)
})

export const threatLevel = asyncHandler(async (req, res) => {
  const data = await dashboardService.getThreatLevel()
  return ok(res, data)
})

export default { overview, alerts, threatLevel }