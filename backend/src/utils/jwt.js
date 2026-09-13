import jwt from 'jsonwebtoken'
import env from '../config/env.js'

export function signToken(payload, expiresIn) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: expiresIn || env.jwtExpiresIn })
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret)
}

export function decodeToken(token) {
  return jwt.decode(token)
}

export default { signToken, verifyToken, decodeToken }