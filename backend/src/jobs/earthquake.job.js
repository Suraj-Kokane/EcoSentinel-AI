import { syncEarthquakes } from '../services/external/earthquake.service.js'
import { logger } from '../config/logger.js'

export async function run() {
  try {
    const result = await syncEarthquakes()
    logger.info('earthquake.job: complete', result)
  } catch (err) {
    logger.error('earthquake.job: failed', { message: err.message })
  }
}

export default { run }