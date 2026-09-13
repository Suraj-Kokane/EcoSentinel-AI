import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import env from './config/env.js'
import routes from './routes/index.js'
import { globalLimiter } from './middleware/rateLimit.middleware.js'
import { notFoundHandler } from './middleware/notFound.middleware.js'
import { errorHandler } from './middleware/error.middleware.js'
import { prisma } from './config/prisma.js'

export function createApp() {
  const app = express()

  // --- core middleware -----------------------------------------------------
  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(
    cors({
      origin: env.corsOrigin.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  )
  app.use(compression())
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))
  if (env.nodeEnv !== 'test') app.use(morgan('tiny'))

  // --- health & routes -----------------------------------------------------
  app.get('/api/health', async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      res.json({ success: true, data: { status: 'ok', db: 'up', time: new Date().toISOString() } })
    } catch {
      res.status(503).json({ success: false, data: { status: 'degraded', db: 'down' } })
    }
  })

  app.use('/api', globalLimiter, routes)

  // --- errors ---------------------------------------------------------------
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

export default createApp