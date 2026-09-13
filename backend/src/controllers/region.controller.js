import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created } from '../utils/response.js'
import * as regionService from '../services/region.service.js'

export const listStates = asyncHandler(async (req, res) => {
  const result = await regionService.listStates(req.query)
  return ok(res, result.data, result.meta)
})

export const getState = asyncHandler(async (req, res) => {
  const state = await regionService.getState(req.params.id)
  return ok(res, state)
})

export const createState = asyncHandler(async (req, res) => {
  const state = await regionService.createState(req.body)
  return created(res, state)
})

export const listDistricts = asyncHandler(async (req, res) => {
  const result = await regionService.listDistricts(req.query)
  return ok(res, result.data, result.meta)
})

export const getDistrict = asyncHandler(async (req, res) => {
  const district = await regionService.getDistrict(req.params.id)
  return ok(res, district)
})

export default { listStates, getState, createState, listDistricts, getDistrict }