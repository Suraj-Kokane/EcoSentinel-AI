import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma.js'
import env from '../config/env.js'
import { signToken } from '../utils/jwt.js'
import { ApiError } from '../utils/ApiError.js'

export function sanitizeUser(user) {
  if (!user) return null
  const { password, ...rest } = user
  return rest
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, env.bcryptRounds)
}

export async function registerUser({ name, email, password, role = 'CITIZEN' }) {
  const normalizedEmail = email.toLowerCase()

  const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (exists) throw ApiError.conflict('An account with this email already exists')

  // Public registration is role-locked to CITIZEN; admins may elevate later.
  const effectiveRole = role === 'ADMIN' || role === 'AUTHORITY' ? 'CITIZEN' : (role || 'CITIZEN')

  const hashed = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, password: hashed, role: effectiveRole },
  })

  return { user: sanitizeUser(user) }
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase()
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (!user) throw ApiError.unauthorized('Invalid email or password')

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw ApiError.unauthorized('Invalid email or password')

  const token = signToken({ sub: user.id, role: user.role })
  return { token, user: sanitizeUser(user) }
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw ApiError.notFound('User not found')
  return sanitizeUser(user)
}

export default { registerUser, loginUser, getProfile, sanitizeUser }