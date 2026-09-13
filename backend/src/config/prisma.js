import { PrismaClient } from '@prisma/client'
import env from './env.js'

// Singleton Prisma client shared across the app (avoid connection churn in dev hot-reload).
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  })

if (env.nodeEnv !== 'production') globalForPrisma.__prisma = prisma

export default prisma