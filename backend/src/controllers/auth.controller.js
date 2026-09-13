import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created } from '../utils/response.js'
import * as authService from '../services/auth.service.js'

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body)
  return created(res, result.user)
})

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body)
  return ok(res, result)
})

export const profile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id)
  return ok(res, user)
})

export default { register, login, profile }