import cron from 'node-cron'
import env from '../config/env.js'
import { logger } from '../config/logger.js'
import weather from './weather.job.js'
import airQuality from './airQuality.job.js'
import earthquake from './earthquake.job.js'
import fire from './fire.job.js'

// Cron registry — schedules all ingestion jobs when ENABLE_JOBS=true.
// Every job is internally try/catch'd: failures are logged, never fatal.
export function startJobs() {
  if (!env.enableJobs) {
    logger.info('Background jobs disabled (ENABLE_JOBS=false)')
    return
  }

  logger.info('Background jobs enabled — scheduling ingestion crons')

  cron.schedule(env.jobCron.weather, weather.run)
  cron.schedule(env.jobCron.airQuality, airQuality.run)
  cron.schedule(env.jobCron.earthquake, earthquake.run)
  cron.schedule(env.jobCron.fire, fire.run)

  // Kick off one initial pass shortly after boot so data appears quickly.
  setTimeout(() => {
    logger.info('Running initial job pass')
    earthquake.run()
    weather.run()
    airQuality.run()
    fire.run()
  }, 5000)
}

export default { startJobs }