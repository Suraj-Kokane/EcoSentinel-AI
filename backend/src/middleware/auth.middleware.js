import { verifyToken } from '../utils/jwt.js'
import { ApiError } from '../utils/ApiError.js'
import { prisma } from '../config/prisma.js'

export const extractToken = (req) => {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return null
}

// Verifies the JWT bearer token and loads the current user onto req.user.
export async function authenticate(req, res, next) {
  try {
    const token = extractToken(req)
    if (!token) throw ApiError.unauthorized('Missing authorization token')

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      throw ApiError.unauthorized('Invalid or expired token')
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) throw ApiError.unauthorized('User no longer exists')

    req.user = { id: user.id, email: user.email, name: user.name, role: user.role }
    next()
  } catch (err) {
    next(err)
  }
}

// Optional auth — attaches user if a valid token is present, otherwise continues.
export async function optionalAuth(req, res, next) {
  const token = extractToken(req)
  if (!token) return next()
  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (user) req.user = { id: user.id, email: user.email, name: user.name, role: user.role }
  } catch {
    /* ignore */
  }
  next()
}

export default { authenticate, optionalAuth, extractToken }