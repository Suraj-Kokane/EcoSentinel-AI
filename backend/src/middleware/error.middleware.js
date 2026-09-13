import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { ApiError } from '../utils/ApiError.js'
import { logger } from '../config/logger.js'
import env from '../config/env.js'

// Central error handler — the LAST middleware. Normalizes ApiError, Zod
// validation errors, Prisma errors, and unexpected errors into one shape.
export function errorHandler(err, req, res, next) {
  // Zod validation
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
    return res.status(422).json({ success: false, message: 'Validation failed', errors: details })
  }

  // Our own operational errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    })
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Unique constraint violation', target: err.meta?.target })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' })
    }
  }

  // Multer / body-parser errors
  if (err.type === 'entity.parse.failed' || err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message })
  }

  logger.error('Unhandled error', { message: err.message, stack: err.stack })
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.nodeEnv !== 'production' ? { stack: err.stack } : {}),
  })
}

export default errorHandler