import http from 'node:http'
import env from './config/env.js'
import { logger } from './config/logger.js'
import { createApp } from './app.js'
import { initSocket } from './sockets/index.js'
import { startJobs } from './jobs/index.js'
import { startMqtt } from './services/external/mqtt.service.js'
import { prisma } from './config/prisma.js'

// Bootstrap: HTTP server + Socket.IO + background jobs + MQTT.
async function main() {
  const app = createApp()
  const server = http.createServer(app)
  initSocket(server)

  startJobs()
  startMqtt()

  server.listen(env.port, () => {
    logger.info(`EcoSentinel AI backend running`, {
      port: env.port,
      env: env.nodeEnv,
      jobs: env.enableJobs,
      mqtt: env.mqttEnabled,
    })
  })

  // graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down`)
    server.close()
    await prisma.$disconnect()
    process.exit(0)
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  logger.error('Fatal boot error', { message: err.message, stack: err.stack })
  process.exit(1)
})