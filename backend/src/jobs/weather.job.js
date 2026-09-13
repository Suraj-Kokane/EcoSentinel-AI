import { syncWeather } from '../services/external/weather.service.js'
import { logger } from '../config/logger.js'

export async function run() {
  try {
    const result = await syncWeather()
    logger.info('weather.job: complete', result)
  } catch (err) {
    // Failures must never crash the server.
    logger.error('weather.job: failed', { message: err.message })
  }
}

export default { run }