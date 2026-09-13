import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created } from '../utils/response.js'
import * as reportService from '../services/report.service.js'

export const listReports = asyncHandler(async (req, res) => {
  const result = await reportService.listReports(req.query)
  return ok(res, result.data, result.meta)
})

export const getReport = asyncHandler(async (req, res) => {
  const report = await reportService.getReport(req.params.id)
  return ok(res, report)
})

export const createReport = asyncHandler(async (req, res) => {
  const report = await reportService.createReport(req.body, req.file, req.user?.id)
  return created(res, report)
})

export const updateReport = asyncHandler(async (req, res) => {
  const report = await reportService.updateReport(req.params.id, req.body)
  return ok(res, report)
})

export const removeReport = asyncHandler(async (req, res) => {
  const result = await reportService.removeReport(req.params.id)
  return ok(res, result)
})

export default { listReports, getReport, createReport, updateReport, removeReport }