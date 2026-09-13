import { Server } from 'socket.io'
import { verifyToken } from '../utils/jwt.js'
import { setSocketIO } from './events.js'
import env from '../config/env.js'
import { logger } from '../config/logger.js'

// Initializes Socket.IO and attaches JWT handshake authentication.
export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: env.corsOrigin.split(',').map((s) => s.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // Authenticate via token passed in the handshake auth object.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication required'))
    try {
      const payload = verifyToken(token)
      socket.user = { id: payload.sub, role: payload.role }
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    logger.info('socket connected', { userId: socket.user?.id })
    socket.on('disconnect', () => {
      logger.info('socket disconnected', { userId: socket.user?.id })
    })
  })

  setSocketIO(io)
  return io
}

export default { initSocket }