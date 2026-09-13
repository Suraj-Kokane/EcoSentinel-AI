import { syncAirQuality } from '../services/external/airQuality.service.js'
import { logger } from '../config/logger.js'

export async function run() {
  try {
    const result = await syncAirQuality()
    logger.info('airQuality.job: complete', result)
  } catch (err) {
    logger.error('airQuality.job: failed', { message: err.message })
  }
}

export default { run }