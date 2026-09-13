import { ApiError } from '../utils/ApiError.js'

// Role-based access control. Usage: requireRole('ADMIN', 'AUTHORITY')
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'))
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Role ${req.user.role} cannot perform this action`))
    }
    next()
  }
}

export const requireAdmin = requireRole('ADMIN')
export const requireAuthority = requireRole('ADMIN', 'AUTHORITY')

export default { requireRole, requireAdmin, requireAuthority }