import { ApiError } from '../utils/ApiError.js'

// 404 fallback for any unmatched route.
export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`))
}

export default notFoundHandler